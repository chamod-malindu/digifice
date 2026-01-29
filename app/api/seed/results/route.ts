
import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import User from '@/models/User';
import DegreeProgram from '@/models/DegreeProgram';
import Module from '@/models/Module';
import Result from '@/models/Result';
import Enrollment from '@/models/Enrollment';
import Department from '@/models/Department'; // Ensure model registration
import { Types } from 'mongoose';

// Helper to calculate grade
const calculateGrade = (marks: number) => {
    if (marks >= 85) return 'A+';
    if (marks >= 75) return 'A';
    if (marks >= 70) return 'A-';
    if (marks >= 65) return 'B+';
    if (marks >= 60) return 'B';
    if (marks >= 55) return 'B-';
    if (marks >= 50) return 'C+';
    if (marks >= 45) return 'C';
    if (marks >= 40) return 'C-';
    return 'F';
};

const firstNames = [
    "Kasun", "Chamara", "Nuwan", "Dilshan", "Sahan", "Kavindu", "Isuru", "Tharindu",
    "Sarah", "John", "Emma", "Michael", "David", "Jessica", "Emily", "Daniel",
    "Ruwan", "Dulani", "Gimhani", "Nimal", "Kamal", "Sunil", "Chathura", "Pradeep"
];
const lastNames = [
    "Perera", "Silva", "Fernando", "Dissanayake", "Bandara", "Rajapaksa", "Jayasuriya", "Mendis",
    "Smith", "Johnson", "Brown", "Taylor", "Miller", "Wilson", "Anderson", "Thomas",
    "Karunaratne", "Wickramasinghe", "Hettiarachchi", "Ranasinghe", "Weerasinghe"
];

const getRandomElement = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export async function GET() {
    try {
        await connectToDB();

        // 0. Cleanup previous seeded data (both "Test Student" and previous realistic ones)
        // We identify them by the bulkUploadBatch prefix 'seed_script_'
        await User.deleteMany({
            $or: [
                { name: { $regex: /^Test Student/ } },
                { bulkUploadBatch: { $regex: /^seed_script_/ } }
            ]
        });

        // 1. Fetch all Degree Programs
        const degrees = await DegreeProgram.find({});
        const resultsLog = [];

        // Process degrees in parallel
        await Promise.all(degrees.map(async (degree) => {
            // 2. Fetch associated Modules
            const modules = await Module.find({ degreeProgram: degree._id });
            if (modules.length === 0) return;

            // 3. Create 5 Students per Degree in parallel
            const studentPromises = Array.from({ length: 5 }, async (_, i) => {
                const randomId = new Types.ObjectId().toString().slice(-4);

                // Generate realistic name
                const fName = getRandomElement(firstNames);
                const lName = getRandomElement(lastNames);
                const studentName = `${fName} ${lName}`;

                // Generate realistic email: <name><id>student@digifice.com (no dots or pluses)
                const cleanName = `${fName.toLowerCase()}${lName.toLowerCase()}`;
                const studentEmail = `${cleanName}${randomId}student@digifice.com`;

                // Create User
                // Note: Password usually needs hashing, storing plain for now as this is a test seed. 
                // If your app hashes in pre-save, this might trigger it. If manual, these won't be login-able without hash.
                let student = await User.findOne({ email: studentEmail });
                if (!student) {
                    student = await User.create({
                        name: studentName,
                        email: studentEmail,
                        password: 'password123',
                        role: 'student',
                        department: degree.department,
                        degreeProgram: degree._id, // Ensure this field matches schema
                        bulkUploadBatch: 'seed_script_' + Date.now()
                    });
                }

                // 4. Enroll & Add Results for each module in parallel for this student
                const enrollmentPromises = modules.map(async (module) => {
                    // Check/Create Enrollment
                    const existingEnrollment = await Enrollment.findOne({ student: student._id, module: module._id });
                    if (!existingEnrollment) {
                        await Enrollment.create({
                            student: student._id,
                            module: module._id,
                            enrolledAt: new Date()
                        });
                    }

                    // Create Result
                    // Check if result exists to avoid duplicates if run multiple times
                    const existingResult = await Result.findOne({
                        studentId: student._id,
                        moduleCode: module.code,
                        semester: module.semester
                    });

                    if (!existingResult) {
                        const marks = Math.floor(Math.random() * (100 - 45 + 1)) + 45; // Random marks 45-100
                        await Result.create({
                            studentId: student._id,
                            studentName: student.name,
                            moduleName: module.name,
                            moduleCode: module.code,
                            semester: module.semester,
                            type: 'Exam',
                            marks: marks,
                            grade: calculateGrade(marks),
                            feedback: 'Auto-generated test result'
                        });
                    }
                });

                await Promise.all(enrollmentPromises);
                return student.name;
            });

            await Promise.all(studentPromises);
            resultsLog.push(`Created 5 students for ${degree.name}`);
        }));

        return NextResponse.json({
            success: true,
            message: "Seeding complete with simple email format",
            log: resultsLog
        });

    } catch (error: any) {
        console.error("Seeding error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
