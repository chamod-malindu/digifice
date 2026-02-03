import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDB from "@/lib/db";
import Medical from "@/models/Medical";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        await connectToDB();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("Fetching derived notifications for user:", session.user.id);

        // Fetch non-pending medical records
        const medicals = await Medical.find({
            student: session.user.id,
            status: { $ne: 'pending' }
        }).sort({ updatedAt: -1 });

        // Fetch student enrollments to get module IDs
        const { default: Enrollment } = await import("@/models/Enrollment");
        const { default: Notice } = await import("@/models/Notice");

        const enrollments = await Enrollment.find({
            student: session.user.id,
            status: 'active'
        });

        const moduleIds = enrollments.map((e: any) => e.module);

        // Fetch recent notices for these modules (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const notices = await Notice.find({
            moduleId: { $in: moduleIds },
            createdAt: { $gte: thirtyDaysAgo }
        }).sort({ createdAt: -1 });

        // Fetch user's notification state
        const { default: NotificationState } = await import("@/models/NotificationState");
        let state = await NotificationState.findOne({ user: session.user.id });

        const dismissedIds = state ? state.dismissedIds : [];
        const readIds = state ? state.readIds : [];

        const medicalNotifications = medicals
            .filter(m => !dismissedIds.includes(m._id.toString()))
            .map(medical => {
                let type = 'info';
                if (medical.status.includes('approved')) type = 'success';
                if (medical.status === 'rejected') type = 'error';

                const formattedStatus = medical.status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

                return {
                    _id: medical._id.toString(),
                    title: 'Medical Request Update',
                    message: `Your medical request submitted on ${new Date(medical.createdAt).toLocaleDateString()} is ${formattedStatus}.`,
                    type: type,
                    read: readIds.includes(medical._id.toString()),
                    createdAt: medical.updatedAt
                };
            });

        const noticeNotifications = notices
            .filter((n: any) => !dismissedIds.includes(n._id.toString()))
            .map((notice: any) => ({
                _id: notice._id.toString(),
                title: `Announcement: ${notice.title}`,
                message: notice.content,
                type: 'notice',
                read: readIds.includes(notice._id.toString()),
                createdAt: notice.createdAt,
                meta: { author: notice.authorName, module: notice.moduleCode }
            }));

        const notifications = [...medicalNotifications, ...noticeNotifications].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return NextResponse.json(notifications);
    } catch (error) {
        console.error("Failed to fetch notifications:", error);
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await connectToDB();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await req.json();
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        const { default: NotificationState } = await import("@/models/NotificationState");

        await NotificationState.findOneAndUpdate(
            { user: session.user.id },
            { $addToSet: { dismissedIds: id } },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete notification:", error);
        return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        await connectToDB();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await req.json();
        const { default: NotificationState } = await import("@/models/NotificationState");

        if (id) {
            await NotificationState.findOneAndUpdate(
                { user: session.user.id },
                { $addToSet: { readIds: id } },
                { upsert: true, new: true }
            );
        } else {
            // Fetch all derived notifications to determine what to mark as read
            const { default: Medical } = await import("@/models/Medical");
            const { default: Enrollment } = await import("@/models/Enrollment");
            const { default: Notice } = await import("@/models/Notice");

            // 1. Get Notification State
            let state = await NotificationState.findOne({ user: session.user.id });
            const dismissedIds = state ? state.dismissedIds : [];
            const readIds = state ? state.readIds : [];

            // 2. Fetch Medicals
            const medicals = await Medical.find({
                student: session.user.id,
                status: { $ne: 'pending' }
            });

            // 3. Fetch Notices
            const enrollments = await Enrollment.find({
                student: session.user.id,
                status: 'active'
            });
            const moduleIds = enrollments.map((e: any) => e.module);

            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const notices = await Notice.find({
                moduleId: { $in: moduleIds },
                createdAt: { $gte: thirtyDaysAgo }
            });

            // 4. Collect Unread IDs
            const unreadMedicalIds = medicals
                .map(m => m._id.toString())
                .filter((id) => !dismissedIds.includes(id) && !readIds.includes(id));

            const unreadNoticeIds = notices
                .map(n => n._id.toString())
                .filter((id: string) => !dismissedIds.includes(id) && !readIds.includes(id));

            const newReadIds = [...unreadMedicalIds, ...unreadNoticeIds];

            if (newReadIds.length > 0) {
                await NotificationState.findOneAndUpdate(
                    { user: session.user.id },
                    { $addToSet: { readIds: { $each: newReadIds } } },
                    { upsert: true, new: true }
                );
            }

            return NextResponse.json({ success: true, count: newReadIds.length });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update notifications:", error);
        return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
    }
}
