
import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import Enrollment from '@/models/Enrollment';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDB();
        const { id } = await params;
        const enrollments = await Enrollment.find({ student: id }).select('module');
        const moduleIds = enrollments.map((e: any) => e.module.toString());
        return NextResponse.json(moduleIds);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
