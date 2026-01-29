import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import Result from '@/models/Result';
import User from '@/models/User';
import { getServerSession } from "next-auth"; // Should use auth, but simpler for now or just fetching all for dem

// Helper to get grade point
function getGradePoint(grade: string): number {
    const points: { [key: string]: number } = {
        'A+': 4.0, 'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D+': 1.3, 'D': 1.0, 'E': 0.0, 'F': 0.0
    };
    return points[grade] || 0.0;
}

export async function GET(req: Request) {
    try {
        await connectToDB();

        // In a real app, we'd get the session user ID.
        // For this demo, we'll try to find a 'Student' user or allow a query param.
        const { searchParams } = new URL(req.url);
        let studentId = searchParams.get('studentId');

        if (!studentId) {
            // Demo Fallback: tailored for "subodha@digifice.com" if available, else first student
            const demoUser = await User.findOne({ email: "subodha@digifice.com" });
            if (demoUser) {
                studentId = demoUser._id;
            } else {
                const student = await User.findOne({ role: 'student' });
                if (student) studentId = student._id;
            }
        }

        if (!studentId) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        const results = await Result.find({ studentId }).sort({ semester: 1 });

        return NextResponse.json(results);
    } catch (error) {
        console.error("Results fetch error:", error);
        return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
    }
}
