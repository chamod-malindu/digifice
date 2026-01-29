import { NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import Medical from "@/models/Medical";
import Notification from "@/models/Notification";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectToDB();
        const { id: medicalRecordId } = await params;
        const { status, adminComments, forwardedTo } = await req.json();

        if (!medicalRecordId || !status) {
            return NextResponse.json({ error: "ID and status are required" }, { status: 400 });
        }

        const updateData: any = {
            status,
            adminComments: adminComments || ''
        };

        if (status === 'forwarded_to_dept' && forwardedTo) {
            updateData.forwardedTo = forwardedTo;
        }

        const updatedMedical = await Medical.findByIdAndUpdate(
            medicalRecordId,
            updateData,
            { new: true }
        );

        if (!updatedMedical) {
            return NextResponse.json({ error: "Medical record not found" }, { status: 404 });
        }

        // Create Notification for the Student
        try {
            console.log("Attempting to create notification for user:", updatedMedical.student);
            console.log("Status update:", status);

            let notificationType = 'info';
            if (status.includes('approved')) notificationType = 'success';
            if (status === 'rejected') notificationType = 'error';

            const formattedStatus = status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

            // Safely get student ID (handle if it's populated or just an ID)
            const studentId = (updatedMedical.student && updatedMedical.student._id)
                ? updatedMedical.student._id
                : updatedMedical.student;

            console.log("Creating notification for Student ID:", studentId);

            const notification = await Notification.create({
                userId: studentId,
                title: 'Medical Request Update',
                message: `Your medical request submitted on ${new Date(updatedMedical.createdAt).toLocaleDateString()} has been ${formattedStatus}.`,
                type: notificationType,
                read: false
            });
            console.log("Notification created successfully:", notification._id);
        } catch (notifError) {
            console.error("Failed to create notification:", notifError);
            // Don't fail the request if notification fails, just log it
        }

        return NextResponse.json(updatedMedical);
    } catch (error) {
        console.error("Failed to update medical:", error);
        return NextResponse.json({ error: "Failed to update medical" }, { status: 500 });
    }
}
