import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Faculty from '@/models/Faculty';
import Department from '@/models/Department';
import DegreeProgram from '@/models/DegreeProgram';

export async function GET(req: NextRequest) {
    await dbConnect();
    try {
        // Fetch all faculties with their departments and degree programs
        // Since we are using references, we can't easily deep populate in one go without multiple queries or aggregations
        // For simplicity and performance with small data, let's fetch lists and reconstruct or just return flat lists

        // Option 1: Aggregation (Better for hierarchy)
        // Option 2: separate endpoints. 
        // Let's try to return a structured object: [ { ...faculty, departments: [ { ...dept, degrees: [...] } ] } ]

        const faculties = await Faculty.find({}).lean();
        const hierarchies = await Promise.all(faculties.map(async (fac: any) => {
            const departments = await Department.find({ faculty: fac._id }).lean();

            const departmentsWithDegrees = await Promise.all(departments.map(async (dept: any) => {
                const degrees = await DegreeProgram.find({ department: dept._id }).lean();
                return { ...dept, degrees };
            }));

            return { ...fac, departments: departmentsWithDegrees };
        }));

        return NextResponse.json(hierarchies);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
