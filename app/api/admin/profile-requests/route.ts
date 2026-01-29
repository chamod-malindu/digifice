import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import ProfileRequest from "@/models/ProfileRequest";
import User from "@/models/User";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await connectToDatabase();

        // Ensure User model is registered
        if (!User) {
            console.log("User model not registered, registering...");
        }

        const requests = await ProfileRequest.find({ status: 'pending' })
            .populate('user', 'name email role')
            .sort({ createdAt: -1 });

        return NextResponse.json(requests);
    } catch (error) {
        console.error("Error fetching admin profile requests:", error);
        return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
    }
}
