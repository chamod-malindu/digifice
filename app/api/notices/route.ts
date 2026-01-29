import { NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import Notice from "@/models/Notice";

export async function GET(req: Request) {
    try {
        await connectToDB();
        const { searchParams } = new URL(req.url);
        const moduleId = searchParams.get('moduleId');

        let query = {};
        if (moduleId) {
            query = { moduleId };
        }

        const notices = await Notice.find(query).sort({ createdAt: -1 });
        return NextResponse.json(notices);
    } catch (error) {
        console.error("Failed to fetch notices:", error);
        return NextResponse.json({ error: "Failed to fetch notices" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectToDB();
        const body = await req.json();

        const newNotice = await Notice.create(body);
        return NextResponse.json(newNotice, { status: 201 });
    } catch (error) {
        console.error("Failed to create notice:", error);
        return NextResponse.json({ error: "Failed to create notice" }, { status: 500 });
    }
}
