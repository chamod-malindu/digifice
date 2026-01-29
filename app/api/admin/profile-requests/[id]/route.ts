import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import ProfileRequest from "@/models/ProfileRequest";
import User from "@/models/User";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;
        const { action } = await req.json(); // action: 'approve' or 'reject'

        if (!['approve', 'reject'].includes(action)) {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        await connectToDatabase();

        const request = await ProfileRequest.findById(id);

        if (!request) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        if (request.status !== 'pending') {
            return NextResponse.json({ error: "Request is not pending" }, { status: 400 });
        }

        if (action === 'reject') {
            request.status = 'rejected';
            await request.save();
            return NextResponse.json({ message: "Request rejected" });
        }

        if (action === 'approve') {
            const updateData: any = {};
            if (request.requestedName) updateData.name = request.requestedName;
            if (request.requestedPassword) updateData.password = request.requestedPassword;

            if (Object.keys(updateData).length > 0) {
                await User.findByIdAndUpdate(request.user, updateData);
            }

            request.status = 'approved';
            await request.save();
            return NextResponse.json({ message: "Request approved and user profile updated" });
        }

    } catch (error) {
        console.error("Error processing profile request:", error);
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}
