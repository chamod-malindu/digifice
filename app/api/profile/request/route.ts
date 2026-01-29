import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import ProfileRequest from "@/models/ProfileRequest";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, password } = await req.json();

        if (!name && !password) {
            return NextResponse.json({ error: "No changes requested" }, { status: 400 });
        }

        await connectToDatabase();

        // Check for existing pending request
        const existingRequest = await ProfileRequest.findOne({
            user: session.user.id,
            status: 'pending'
        });

        if (existingRequest) {
            return NextResponse.json({ error: "You already have a pending profile update request" }, { status: 400 });
        }

        const updateData: any = {
            user: session.user.id,
            status: 'pending'
        };

        if (name && name !== session.user.name) {
            updateData.requestedName = name;
        }

        if (password) {
            updateData.requestedPassword = await bcrypt.hash(password, 10);
        }

        if (!updateData.requestedName && !updateData.requestedPassword) {
            return NextResponse.json({ error: "No changes requested" }, { status: 400 });
        }

        const profileRequest = await ProfileRequest.create(updateData);

        return NextResponse.json(profileRequest);
    } catch (error) {
        console.error("Error creating profile request:", error);
        return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        const pendingRequest = await ProfileRequest.findOne({
            user: session.user.id,
            status: 'pending'
        });

        return NextResponse.json(pendingRequest);
    } catch (error) {
        console.error("Error fetching profile request:", error);
        return NextResponse.json({ error: "Failed to fetch request" }, { status: 500 });
    }
}
