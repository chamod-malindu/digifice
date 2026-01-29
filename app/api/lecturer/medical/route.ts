import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDB from "@/lib/db";
import Medical from "@/models/Medical";
import Notification from "@/models/Notification";
import User from "@/models/User";

export async function GET(req: Request) {
    try {
        await connectToDB();
        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.role !== 'lecturer') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch requests that have been forwarded to the department
        // In a real query, we might filter by the lecturer's specific department if that data exists.
        // For now, we assume all forwarded requests are visible to any lecturer (or Department Head).
        const medicals = await Medical.find({ status: 'forwarded_to_dept' })
            .populate('student', 'name email image')
            .sort({ createdAt: -1 });

        return NextResponse.json(medicals);
    } catch (error) {
        console.error("Failed to fetch medicals:", error);
        return NextResponse.json({ error: "Failed to fetch medicals" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        await connectToDB();
        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.role !== 'lecturer') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, status, adminComments } = await req.json();

        if (!id || !status) {
            return NextResponse.json({ error: "ID and status are required" }, { status: 400 });
        }

        if (!['approved_by_dept', 'rejected'].includes(status)) {
            return NextResponse.json({ error: "Invalid status update" }, { status: 400 });
        }

        const updatedMedical = await Medical.findByIdAndUpdate(
            id,
            {
                status,
                adminComments: adminComments || ''
            },
            { new: true }
        );

        if (!updatedMedical) {
            return NextResponse.json({ error: "Medical record not found" }, { status: 404 });
        }

        // Create Notification for the student
        const title = status === 'approved_by_dept' ? 'Medical Request Approved' : 'Medical Request Rejected';
        const type = status === 'approved_by_dept' ? 'success' : 'error';
        const message = adminComments
            ? `Your medical request has been ${status === 'approved_by_dept' ? 'approved' : 'rejected'}. Message: ${adminComments}`
            : `Your medical request has been ${status === 'approved_by_dept' ? 'approved' : 'rejected'}.`;

        await Notification.create({
            userId: updatedMedical.student,
            title,
            message,
            type,
            read: false
        });

        return NextResponse.json(updatedMedical);
    } catch (error) {
        console.error("Failed to update medical:", error);
        return NextResponse.json({ error: "Failed to update medical" }, { status: 500 });
    }
}
