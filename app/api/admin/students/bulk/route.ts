
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDB from "@/lib/db";
import User from "@/models/User";
import Department from "@/models/Department";
import DegreeProgram from "@/models/DegreeProgram";
import Faculty from "@/models/Faculty";
import bcrypt from "bcryptjs";
import Module from "@/models/Module";
import Enrollment from "@/models/Enrollment";

export async function POST(req: Request) {
    try {
        await connectToDB();

        // Force model registration
        const _d = Department;
        const _f = Faculty;
        const _dp = DegreeProgram;
        const _m = Module;
        const _e = Enrollment;

        const session = await getServerSession(authOptions);
        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { students } = body;

        if (!Array.isArray(students) || students.length === 0) {
            return NextResponse.json({ error: "Invalid payload: students array required" }, { status: 400 });
        }

        const batchId = `batch_${Date.now()}`;
        const results = {
            total: students.length,
            success: 0,
            failed: 0,
            batchId,
            errors: [] as string[]
        };

        // Cache Depertments and Degrees to minimize DB calls
        const allDepts = await Department.find({});
        const deptMap = new Map(allDepts.map(d => [d.name.toLowerCase(), d]));

        const allDegrees = await DegreeProgram.find({});
        const degreeMap = new Map(allDegrees.map(d => [d.name.toLowerCase(), d]));

        // Cache for degree modules to avoid repeated DB calls
        const degreeModulesCache = new Map<string, string[]>();

        // Default password hash
        const hashedPassword = await bcrypt.hash("password123", 10);

        for (const student of students) {
            try {
                // Validation
                if (!student.Email || !student.Name) {
                    results.failed++;
                    results.errors.push(`Row missing Email or Name: ${JSON.stringify(student)}`);
                    continue;
                }

                // Check duplicate email
                const existingUser = await User.findOne({ email: student.Email });
                if (existingUser) {
                    results.failed++;
                    results.errors.push(`Email already exists: ${student.Email}`);
                    continue;
                }

                // Find Department
                let departmentId = undefined;
                if (student.Department) {
                    const dept = deptMap.get(student.Department.toLowerCase().trim());
                    if (dept) {
                        departmentId = dept._id;
                    }
                }

                // Find Degree Program
                let degreeProgramId = undefined;
                if (student['Degree Program']) {
                    const deg = degreeMap.get(student['Degree Program'].toLowerCase().trim());
                    if (deg) {
                        degreeProgramId = deg._id;
                    }
                }

                const newUser = await User.create({
                    name: student.Name,
                    email: student.Email,
                    password: hashedPassword,
                    role: 'student',
                    department: departmentId,
                    degreeProgram: degreeProgramId,
                    bulkUploadBatch: batchId,
                    image: `https://ui-avatars.com/api/?name=${encodeURIComponent(student.Name)}&background=random`
                });

                // Auto-Enrollment Logic
                if (degreeProgramId) {
                    const degIdStr = degreeProgramId.toString();

                    // Fetch and cache modules if not already cached
                    if (!degreeModulesCache.has(degIdStr)) {
                        const modules = await Module.find({ degreeProgram: degreeProgramId }).select('_id');
                        degreeModulesCache.set(degIdStr, modules.map(m => m._id.toString()));
                    }

                    const moduleIds = degreeModulesCache.get(degIdStr);

                    if (moduleIds && moduleIds.length > 0) {
                        const enrollments = moduleIds.map(moduleId => ({
                            student: newUser._id,
                            module: moduleId,
                            status: 'active',
                            enrolledAt: new Date()
                        }));

                        // Use insertMany with ordered: false to continue if some enrollments fail (e.g. duplicates)
                        try {
                            await Enrollment.insertMany(enrollments, { ordered: false });
                        } catch (enrollErr: any) {
                            // Ignore duplicate key errors (code 11000), log others if needed
                            if (enrollErr.code !== 11000) {
                                console.warn(`Failed to enroll ${student.Email} in some modules:`, enrollErr.message);
                            }
                        }
                    }
                }

                results.success++;

            } catch (err: any) {
                results.failed++;
                results.errors.push(`Error creating ${student.Email}: ${err.message}`);
            }
        }

        return NextResponse.json(results);

    } catch (error) {
        console.error("Bulk upload error:", error);
        return NextResponse.json({ error: "Failed to process bulk upload" }, { status: 500 });
    }
}
