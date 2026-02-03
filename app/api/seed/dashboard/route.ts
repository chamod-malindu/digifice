import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDB from "@/lib/db";
import Faculty from "@/models/Faculty";
import Department from "@/models/Department";
import User from "@/models/User";
import Medical from "@/models/Medical";
import Module from "@/models/Module";
import LecturerTask from "@/models/LecturerTask";
import Enrollment from "@/models/Enrollment";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized. Please log in to seed data for your account." }, { status: 401 });
        }

        await connectToDB();
        const userId = session.user.id;

        // 1. Seed Tasks
        await LecturerTask.deleteMany({ lecturerId: userId }); // Clear existing for demo

        const today = new Date();
        const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        const dayAfter = new Date(today); dayAfter.setDate(today.getDate() + 2);
        const lastWeek = new Date(today); lastWeek.setDate(today.getDate() - 7);

        const tasks = [
            {
                title: "CS101 Lecture",
                date: today,
                startTime: "09:00",
                endTime: "11:00",
                lecturerId: userId,
                status: "planned"
            },
            {
                title: "Department Meeting",
                date: today,
                startTime: "14:00",
                endTime: "15:00",
                lecturerId: userId,
                status: "planned"
            },
            {
                title: "Project Supervision",
                date: tomorrow,
                startTime: "10:00",
                endTime: "12:00",
                lecturerId: userId,
                status: "planned"
            },
            {
                title: "Research Grant Review",
                date: dayAfter,
                startTime: "13:00",
                endTime: "16:00",
                lecturerId: userId,
                status: "postponed"
            },
            {
                title: "Grading Assignments",
                date: lastWeek,
                startTime: "09:00",
                endTime: "17:00",
                lecturerId: userId,
                status: "completed"
            },
            {
                title: "Curriculum Planning",
                date: lastWeek,
                startTime: "10:00",
                endTime: "11:00",
                lecturerId: userId,
                status: "completed"
            }
        ];

        await LecturerTask.insertMany(tasks);

        // 2. Seed Modules for Lecturer
        const moduleCount = await Module.countDocuments({ leader: userId });
        if (moduleCount === 0) {
            await Module.create([
                {
                    name: "Introduction to Computer Science",
                    code: "CS101",
                    credits: 3,
                    semester: "Sem 1",
                    leader: userId
                },
                {
                    name: "Advanced Algorithms",
                    code: "CS302",
                    credits: 4,
                    semester: "Sem 5",
                    leader: userId
                }
            ]);
        }

        // 3. Ensure some stats exist (global stats, not user specific usually, but good to check)
        const studentCount = await User.countDocuments({ role: 'student' });
        // --- 4. Seed Faculty & Departments ---
        const facultyCount = await Faculty.countDocuments({});
        if (facultyCount === 0) {
            const faculty = await Faculty.create({
                name: "Faculty of Computing",
                code: "FOC"
            });

            const deptSE = await Department.create({
                name: "Software Engineering",
                code: "SE",
                faculty: faculty._id
            });

            const deptCS = await Department.create({
                name: "Cyber Security",
                code: "CS",
                faculty: faculty._id
            });

            // Create Lecturers for these departments
            const lecturerSE1 = await User.create({
                name: "Dr. Alan Turing",
                email: "alan@digifice.com",
                password: "password", // simplified
                role: "lecturer",
                department: deptSE._id
            });

            const lecturerSE2 = await User.create({
                name: "Dr. Grace Hopper",
                email: "grace@digifice.com",
                password: "password",
                role: "lecturer",
                department: deptSE._id
            });

            const lecturerCS1 = await User.create({
                name: "Dr. Ada Lovelace",
                email: "ada@digifice.com",
                password: "password",
                role: "lecturer",
                department: deptCS._id
            });

            // Assign HOD
            await Department.findByIdAndUpdate(deptSE._id, { head: lecturerSE1._id });
        }


        // 3. Seed Medical Requests
        const medicalCount = await Medical.countDocuments({});
        if (medicalCount === 0) {
            // Find a student to assign medicals to
            const student = await User.findOne({ role: 'student' });
            if (student) {
                await Medical.create([
                    {
                        student: student._id,
                        status: 'forwarded_to_dept',
                        reason: 'Viral Fever',
                        startDate: new Date(),
                        endDate: new Date(new Date().setDate(new Date().getDate() + 2)),
                        officerComments: 'Verified with medical center.'
                    },
                    {
                        student: student._id,
                        status: 'pending',
                        reason: 'Migraine',
                        startDate: new Date(new Date().setDate(new Date().getDate() - 5)),
                        endDate: new Date(new Date().setDate(new Date().getDate() - 4)),
                    },
                    {
                        student: student._id,
                        status: 'approved_by_dept',
                        reason: 'Sports Injury',
                        startDate: new Date(new Date().setDate(new Date().getDate() - 10)),
                        endDate: new Date(new Date().setDate(new Date().getDate() - 7)),
                        officerComments: 'Verified.',
                        adminComments: 'Approved.'
                    }
                ]);
            } else {
                // Create a dummy student if none exists, just to be safe
                const newStudent = await User.create({
                    name: "Test Student",
                    email: "student@test.com",
                    password: "hashedpassword", // simplified
                    role: "student",
                    image: "https://github.com/shadcn.png"
                });

                await Medical.create([
                    {
                        student: newStudent._id,
                        status: 'forwarded_to_dept',
                        reason: 'Viral Fever',
                        startDate: new Date(),
                        endDate: new Date(new Date().setDate(new Date().getDate() + 2)),
                        officerComments: 'Verified with medical center.'
                    }
                ]);
            }
            // 4. Seed Enrollments
            // Make sure we have the specific module and student if we want deterministic testing, 
            // or just pick randoms.
            const allModules = await Module.find({});
            const allStudents = await User.find({ role: 'student' });

            if (allModules.length > 0 && allStudents.length > 0) {
                // Check if any enrollments exist
                const enrollmentCount = await Enrollment.countDocuments({});

                if (enrollmentCount === 0) {
                    const enrollmentData = [];

                    // For each module, assign random students
                    for (const module of allModules) {
                        // Pick 3 random students for each module
                        const shuffledStudents = allStudents.sort(() => 0.5 - Math.random()).slice(0, 3);

                        for (const student of shuffledStudents) {
                            enrollmentData.push({
                                student: student._id,
                                module: module._id,
                                status: 'active',
                                enrolledAt: new Date()
                            });
                        }
                    }

                    if (enrollmentData.length > 0) {
                        try {
                            await Enrollment.insertMany(enrollmentData);
                        } catch (e) {
                            console.log("Enrollment seed minor error (likely dupes):", e);
                        }
                    }
                }
            }

            return NextResponse.json({
                message: "Dashboard seeded successfully!",
                tasksCreated: tasks.length,
                modulesCreated: moduleCount === 0 ? 2 : 0,
                medicalsCheck: "Complete",
                enrollmentsCheck: "Complete"
            });
        }
    } catch (error: any) {
        console.error("Seeding error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
