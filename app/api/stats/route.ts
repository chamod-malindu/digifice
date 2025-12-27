import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Module from '@/models/Module';

export async function GET() {
    try {
        await dbConnect();

        const [
            totalUsers,
            totalStudents,
            totalLecturers,
            totalModules
        ] = await Promise.all([
            User.countDocuments({}),
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ role: 'lecturer' }),
            Module.countDocuments({})
        ]);

        return NextResponse.json({
            users: {
                total: totalUsers,
                students: totalStudents,
                lecturers: totalLecturers
            },
            modules: {
                total: totalModules
            }
        });
    } catch (error) {
        console.error("Stats fetch error:", error);
        return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }
}
