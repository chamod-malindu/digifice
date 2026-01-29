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

        const { studentIds, moduleIds } = await req.json();

        if (!Array.isArray(studentIds) || !Array.isArray(moduleIds) || studentIds.length === 0 || moduleIds.length === 0) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        let createdCount = 0;
        const errors = [];

        // Determine potential enrollments
        for (const studentId of studentIds) {
            for (const moduleId of moduleIds) {
                try {
                    // Check existence to prevent error on uniq index, 
                    // or use updateOne with upsert if status handling allows
                    const exists = await Enrollment.findOne({ student: studentId, module: moduleId });

                    if (!exists) {
                        await Enrollment.create({
                            student: studentId,
                            module: moduleId,
                            status: 'active',
                            enrolledAt: new Date()
                        });
                        createdCount++;
                    }
                } catch (e: any) {
                    errors.push(e.message);
                }
            }
        }

        return NextResponse.json({ success: true, createdCount });
    } catch (error) {
        console.error("Batch enroll error:", error);
        return NextResponse.json({ error: "Failed to process batch enroll" }, { status: 500 });
    }
}
