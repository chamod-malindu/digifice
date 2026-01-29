
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import Faculty from '@/models/Faculty';
import Department from '@/models/Department';
import DegreeProgram from '@/models/DegreeProgram';
import connectToDB from '@/lib/db';

export async function GET(request: Request) {
    try {
        await connectToDB();
        const { searchParams } = new URL(request.url);

        const facultyId = searchParams.get('faculty');
        const departmentId = searchParams.get('department');
        const degreeId = searchParams.get('degree');

        let facultyName = "";
        let departmentName = "";
        let degreeName = "";

        if (facultyId) {
            const fac = await Faculty.findById(facultyId);
            if (fac) facultyName = fac.name;
        }
        if (departmentId) {
            const dept = await Department.findById(departmentId);
            if (dept) departmentName = dept.name;
        }
        if (degreeId) {
            const deg = await DegreeProgram.findById(degreeId);
            if (deg) degreeName = deg.name;
        }

        // Define Headers
        const headers = ["Name", "Email", "Faculty", "Department", "Degree Program"];

        // Define Sample Row with pre-filled data
        const sampleRow = [
            "John Doe",
            "john.doe@example.com",
            facultyName,
            departmentName,
            degreeName
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);

        // Auto-width for columns
        const wscols = [
            { wch: 20 }, // Name
            { wch: 30 }, // Email
            { wch: 25 }, // Faculty
            { wch: 25 }, // Dept
            { wch: 25 }, // Degree
        ];
        ws['!cols'] = wscols;

        XLSX.utils.book_append_sheet(wb, ws, "Template");

        const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        return new NextResponse(buf, {
            status: 200,
            headers: {
                'Content-Disposition': `attachment; filename="student_upload_template.xlsx"`,
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        });

    } catch (error) {
        console.error("Template Generation Error:", error);
        return NextResponse.json({ error: "Failed to generate template" }, { status: 500 });
    }
}
