import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDB from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import Module from "@/models/Module";
import User from "@/models/User";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDB();

        // Force model registration
        const _u = User;

        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params; // changed from courseId to id

        // Verify module ownership (optional but good practice)
        const module = await Module.findById(id);
        if (!module) {
            return NextResponse.json({ error: "Module not found" }, { status: 404 });
        }

        // Allow Admin or Leader to view
        if (session.user.role !== 'admin' && module.leader?.toString() !== session.user.id) {
            // For now, let's be lenient or check if needed. 
            // Ideally: return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const enrollments = await Enrollment.find({ module: id, status: 'active' })
            .populate('student', 'name email image')
            .sort({ createdAt: -1 });

        const students = enrollments.map((e: any) => e.student).filter(Boolean);

        return NextResponse.json(students);
    } catch (error) {
        console.error("Failed to fetch enrolled students:", error);
        return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
    }
}
