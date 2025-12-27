import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Faculty, Department, DegreeProgram } from '@/models/Hierarchy';

export async function GET() {
    await dbConnect();
    try {
        const facs = await Faculty.find({});
        const depts = await Department.find({});
        const degrees = await DegreeProgram.find({});
        return NextResponse.json({ faculties: facs, departments: depts, degrees: degrees });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
