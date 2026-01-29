import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDB from "@/lib/db";
import Module from "@/models/Module";

export async function GET(req: Request) {
    try {
        await connectToDB();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const lecturerId = session.user.id;

        const modules = await Module.find({ leader: lecturerId })
            .sort({ createdAt: -1 });

        return NextResponse.json({ modules });
    } catch (error) {
        console.error("Failed to fetch lecturer courses:", error);
        return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
    }
}
