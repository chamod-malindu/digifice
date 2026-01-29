import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDB from "@/lib/db";
import Medical from "@/models/Medical";

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

        const notifications = medicals.map(medical => {
            let type = 'info';
            if (medical.status.includes('approved')) type = 'success';
            if (medical.status === 'rejected') type = 'error';

            const formattedStatus = medical.status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

            return {
                _id: medical._id, // Use medical ID as notification ID
                title: 'Medical Request Update',
                message: `Your medical request submitted on ${new Date(medical.createdAt).toLocaleDateString()} is ${formattedStatus}.`,
                type: type,
                read: true, // Derived notifications are stateless for now, mark as read to avoid UI "new" styling persistence issues or implement explicit tracking later
                createdAt: medical.updatedAt
            };
        });

        console.log("Derived notifications count:", notifications.length);

        return NextResponse.json(notifications);
    } catch (error) {
        console.error("Failed to fetch notifications:", error);
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
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

        if (id) {
            // Mark specific notification as read
            await Notification.findByIdAndUpdate(id, { read: true });
        } else {
            // Mark all as read
            await Notification.updateMany({ userId: session.user.id, read: false }, { read: true });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update notifications:", error);
        return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
    }
}
