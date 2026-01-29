import { NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import Module from "@/models/Module";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectToDB();
        const { id } = await params;

        // In real app, verify lecturer owns this module.
        const module = await Module.findById(id).populate('leader');

        if (!module) {
            return NextResponse.json({ error: "Module not found" }, { status: 404 });
        }

        return NextResponse.json(module);
    } catch (error) {
        console.error("Failed to fetch module:", error);
        return NextResponse.json({ error: "Failed to fetch module" }, { status: 500 });
    }
}
