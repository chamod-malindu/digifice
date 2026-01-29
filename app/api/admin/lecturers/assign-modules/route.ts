import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDB from "@/lib/db";
import Module from "@/models/Module";

export async function POST(req: Request) {
    try {
        await connectToDB();
        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { lecturerId, moduleIds } = await req.json();

        if (!lecturerId || !Array.isArray(moduleIds)) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        // 1. Unassign all modules currently assigned to this lecturer
        await Module.updateMany(
            { leader: lecturerId },
            { $unset: { leader: "" } }
        );

        // 2. Assign the selected modules to this lecturer
        if (moduleIds.length > 0) {
            await Module.updateMany(
                { _id: { $in: moduleIds } },
                { $set: { leader: lecturerId } }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to assign modules:", error);
        return NextResponse.json({ error: "Failed to assign modules" }, { status: 500 });
    }
}
