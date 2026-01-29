import { NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import Medical from "@/models/Medical";
import User from "@/models/User";

// Force model registration
if (!User) {
    console.log("User model not loaded");
}

export async function GET() {
    try {
        await connectToDB();
        const medicals = await Medical.find().populate({
            path: 'student',
            select: 'name email image department',
            populate: { path: 'department', select: 'name faculty' }
        }).sort({ createdAt: -1 });
        return NextResponse.json(medicals);
    } catch (error) {
        console.error("Failed to fetch medicals:", error);
        return NextResponse.json({ error: "Failed to fetch medicals" }, { status: 500 });
    }
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        await connectToDB();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        // Enforce the student to be the logged-in user
        const newMedical = await Medical.create({
            ...body,
            student: session.user.id
        });

        return NextResponse.json(newMedical, { status: 201 });
    } catch (error) {
        console.error("Failed to create medical:", error);
        return NextResponse.json({ error: "Failed to create medical" }, { status: 500 });
    }
}
