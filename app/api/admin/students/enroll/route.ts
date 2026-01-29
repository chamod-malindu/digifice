import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDB from "@/lib/db";
import Enrollment from "@/models/Enrollment";

export async function POST(req: Request) {
    try {
        await connectToDB();
        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { studentId, moduleIds } = await req.json();

        if (!studentId || !Array.isArray(moduleIds)) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        // 1. Fetch current enrollments
        const currentEnrollments = await Enrollment.find({ student: studentId }).select('module');
        const currentModuleIds = currentEnrollments.map((e: any) => e.module.toString());

        // 2. Determine what to add and what to remove
        const toAdd = moduleIds.filter((id: string) => !currentModuleIds.includes(id));
        const toRemove = currentModuleIds.filter((id: string) => !moduleIds.includes(id));

        // 3. Remove dropped modules
        if (toRemove.length > 0) {
            await Enrollment.deleteMany({
                student: studentId,
                module: { $in: toRemove }
            });
        }

        // 4. Add new modules
        if (toAdd.length > 0) {
            const newEnrollments = toAdd.map((moduleId: string) => ({
                student: studentId,
                module: moduleId,
                status: 'active',
                enrolledAt: new Date()
            }));
            await Enrollment.insertMany(newEnrollments);
        }

        return NextResponse.json({ success: true, added: toAdd.length, removed: toRemove.length });
    } catch (error) {
        console.error("Failed to update enrollments:", error);
        return NextResponse.json({ error: "Failed to update enrollments" }, { status: 500 });
    }
}
