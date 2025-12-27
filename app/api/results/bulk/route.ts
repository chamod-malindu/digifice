import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Result from '@/models/Result';
import User from '@/models/User';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json(); // Expecting array of objects

        if (!Array.isArray(body)) {
            return NextResponse.json({ error: 'Invalid format. Expected an array.' }, { status: 400 });
        }

        const resultsToCreate = [];
        const errors = [];

        for (const item of body) {
            let studentId = item.studentId;

            // Smart lookup: If email is provided instead of ID, find the student
            if (!studentId && item.email) {
                const student = await User.findOne({ email: item.email });
                if (student) {
                    studentId = student._id;
                } else {
                    errors.push(`Student not found for email: ${item.email}`);
                    continue;
                }
            }

            if (!studentId) {
                errors.push(`Missing Student ID or Email for module: ${item.moduleName}`);
                continue;
            }

            resultsToCreate.push({
                studentId,
                moduleName: item.moduleName,
                moduleCode: item.moduleCode || 'N/A',
                semester: item.semester || 'Sem 1', // Default or required
                type: item.type || 'Exam',
                marks: Number(item.marks),
                grade: item.grade,
                feedback: item.feedback
            });
        }

        if (resultsToCreate.length > 0) {
            await Result.insertMany(resultsToCreate);
        }

        return NextResponse.json({
            message: `Successfully uploaded ${resultsToCreate.length} results.`,
            errors: errors.length > 0 ? errors : undefined,
        }, { status: 201 });

    } catch (error: any) {
        console.error("Bulk upload error:", error);
        return NextResponse.json({ error: error.message || 'Failed to upload results' }, { status: 500 });
    }
}
