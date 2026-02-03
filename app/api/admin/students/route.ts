
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDB from "@/lib/db";
import User from "@/models/User";
import Department from "@/models/Department";
import Faculty from "@/models/Faculty";
import DegreeProgram from "@/models/DegreeProgram";
import Enrollment from "@/models/Enrollment";

export async function GET(req: Request) {
    try {
        await connectToDB();

        // Force model registration
        const _d = Department;
        const _f = Faculty;
        const _dp = DegreeProgram;

        const session = await getServerSession(authOptions);

        // Allow lecture/admin access or implement specific checks
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');
        const facultyId = searchParams.get('facultyId');
        const departmentId = searchParams.get('departmentId');
        const degreeId = searchParams.get('degreeId');
        const moduleId = searchParams.get('moduleId');

        const query: any = { role: 'student' };

        // Search
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        // Direct Filters
        if (departmentId) {
            query.department = departmentId;
        }
        if (degreeId) {
            query.degreeProgram = degreeId;
        }

        // Module Filter (Requires indirect lookup via Enrollments)
        if (moduleId) {
            const enrollments = await Enrollment.find({ module: moduleId }).select('student');
            const studentIds = enrollments.map((e: any) => e.student);

            // Intersection with existing query
            if (query._id) {
                query._id = { $in: studentIds.filter((id: any) => query._id['$in'].includes(id)) };
            } else {
                query._id = { $in: studentIds };
            }
        }

        // Faculty Filter (Requires finding departments under this faculty)
        if (facultyId && !departmentId) {
            // If departmentId is set, faculty is implicitly handled. 
            // If only faculty is set, find all departments for this faculty
            const departments = await Department.find({ faculty: facultyId }).select('_id');
            const deptIds = departments.map((d: any) => d._id);
            query.department = { $in: deptIds };
        }

        // Pagination
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '25');
        const skip = (page - 1) * limit;

        const total = await User.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        const students = await User.find(query)
            .select('name email image department degreeProgram academicYear semester')
            .populate({
                path: 'department',
                select: 'name faculty',
                populate: { path: 'faculty', select: 'name' }
            })
            .populate({
                path: 'degreeProgram',
                select: 'name'
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        return NextResponse.json({
            students,
            pagination: {
                total,
                pages: totalPages,
                current: page,
                limit
            }
        });
    } catch (error) {
        console.error("Failed to fetch students:", error);
        return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
    }
}
