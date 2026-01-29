const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable');
    process.exit(1);
}

// Schemas
const UserSchema = new mongoose.Schema({}, { strict: false });
const ResultSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentName: String,
    moduleName: String,
    moduleCode: String,
    semester: String,
    type: String,
    marks: Number,
    grade: String,
    feedback: String
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Result = mongoose.models.Result || mongoose.model('Result', ResultSchema);

async function seedResults() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Target specific user and all students
        const specificEmail = "subodha@digifice.com";
        const students = await User.find({
            $or: [
                { email: specificEmail },
                { role: 'student' }
            ]
        });

        if (students.length === 0) {
            console.log("No students found.");
            process.exit(1);
        }

        console.log(`Found ${students.length} users to seed results for.`);

        // Clear existing results for these students
        const studentIds = students.map(s => s._id);
        await Result.deleteMany({ studentId: { $in: studentIds } });
        console.log("Cleared existing results.");

        const allResults = [];

        for (const student of students) {
            console.log(`Generating results for: ${student.name || student.email}`);

            const studentResults = [
                // Sem 1
                { studentId: student._id, moduleName: "Intro to Programming", moduleCode: "CS101", semester: "Sem 1", marks: 85, grade: "A", type: "Exam" },
                { studentId: student._id, moduleName: "Mathematics I", moduleCode: "MA101", semester: "Sem 1", marks: 78, grade: "A-", type: "Exam" },
                { studentId: student._id, moduleName: "Web Basics", moduleCode: "CS102", semester: "Sem 1", marks: 92, grade: "A+", type: "Project" },

                // Sem 2
                { studentId: student._id, moduleName: "Data Structures", moduleCode: "CS103", semester: "Sem 2", marks: 65, grade: "B", type: "Exam" },
                { studentId: student._id, moduleName: "Database Systems", moduleCode: "DB101", semester: "Sem 2", marks: 88, grade: "A", type: "Exam" },
                { studentId: student._id, moduleName: "Operating Systems", moduleCode: "OS101", semester: "Sem 2", marks: 72, grade: "B+", type: "Exam" },

                // Sem 3
                { studentId: student._id, moduleName: "Algorithms", moduleCode: "CS201", semester: "Sem 3", marks: 55, grade: "C+", type: "Exam" },
                { studentId: student._id, moduleName: "Software Engineering", moduleCode: "SE201", semester: "Sem 3", marks: 82, grade: "A-", type: "Project" },
                { studentId: student._id, moduleName: "Computer Networks", moduleCode: "NW201", semester: "Sem 3", marks: 74, grade: "B", type: "Exam" },
            ];

            allResults.push(...studentResults);
        }

        await Result.create(allResults);
        console.log(`Successfully seeded ${allResults.length} results across ${students.length} students.`);
        process.exit(0);

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

seedResults();
