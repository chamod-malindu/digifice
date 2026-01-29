
import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import Faculty from '@/models/Faculty';
import Department from '@/models/Department';
import DegreeProgram from '@/models/DegreeProgram';
import Module from '@/models/Module';

export async function GET(request: Request) {
    try {
        await connectToDB();
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const parentId = searchParams.get('parentId');

        // If no type provided, fallback to old behavior (full hierarchy) or just return faculties
        // For this implementation, we enforce type to be explicit
        if (!type) {
            // Optional: Return all faculties as default entry point
            const data = await Faculty.find({}).sort({ name: 1 });
            return NextResponse.json(data);
        }

        let data;

        switch (type) {
            case 'faculty':
                data = await Faculty.find({}).sort({ name: 1 });
                break;
            case 'department':
                if (!parentId) return NextResponse.json({ error: "Missing parentId for department" }, { status: 400 });
                data = await Department.find({ faculty: parentId }).sort({ name: 1 });
                break;
            case 'degree':
                if (!parentId) return NextResponse.json({ error: "Missing parentId for degree" }, { status: 400 });
                data = await DegreeProgram.find({ department: parentId }).sort({ name: 1 });
                break;
            case 'module':
                if (!parentId) return NextResponse.json({ error: "Missing parentId for module" }, { status: 400 });
                // Modules are linked to Degree Programs
                data = await Module.find({ degreeProgram: parentId }).sort({ name: 1 });
                break;
            default:
                return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error("Hierarchy API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
