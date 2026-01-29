import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Module from '@/models/Module';
import Medical from '@/models/Medical';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        const [
            totalUsers,
            totalStudents,
            totalLecturers,
            totalAdmins,
            totalModules,
            medicalPending,
            medicalApproved,
            medicalForwarded,
            medicalRejected
        ] = await Promise.all([
            User.countDocuments({}),
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ role: 'lecturer' }),
            User.countDocuments({ role: 'admin' }),
            Module.countDocuments({}),
            Medical.countDocuments({ status: 'pending' }),
            Medical.countDocuments({ status: 'approved_by_officer' }),
            Medical.countDocuments({ status: 'forwarded_to_dept' }),
            Medical.countDocuments({ status: 'rejected' })
        ]);

        let lecturerModulesCount = 0;
        if (session && session.user && session.user.role === 'lecturer') {
            lecturerModulesCount = await Module.countDocuments({ leader: session.user.id });
        }

        return NextResponse.json({
            users: {
                total: totalUsers,
                students: totalStudents,
                lecturers: totalLecturers,
                admins: totalAdmins
            },
            modules: {
                total: totalModules,
                myCount: lecturerModulesCount
            },
            medical: {
                pending: medicalPending,
                approved: medicalApproved,
                forwarded: medicalForwarded,
                rejected: medicalRejected
            }
        });
    } catch (error) {
        console.error("Stats fetch error:", error);
        return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }
}
