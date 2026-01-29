const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

// Define Schemas locally for seeding script to avoid TS issues
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'lecturer', 'admin'], default: 'student' },
}, { timestamps: true });

const FacultySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
}, { timestamps: true });

const DepartmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
}, { timestamps: true });

const DegreeProgramSchema = new mongoose.Schema({
    name: { type: String, required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
}, { timestamps: true });

const ModuleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    credits: { type: Number, required: true },
    semester: { type: String, required: true },
    degreeProgram: { type: mongoose.Schema.Types.ObjectId, ref: 'DegreeProgram', required: true },
}, { timestamps: true });

const ResultSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    moduleName: String,
    moduleCode: String,
    semester: String,
    type: String,
    marks: Number,
    grade: String,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Faculty = mongoose.models.Faculty || mongoose.model('Faculty', FacultySchema);
const Department = mongoose.models.Department || mongoose.model('Department', DepartmentSchema);
const DegreeProgram = mongoose.models.DegreeProgram || mongoose.model('DegreeProgram', DegreeProgramSchema);
const Module = mongoose.models.Module || mongoose.model('Module', ModuleSchema);
const Result = mongoose.models.Result || mongoose.model('Result', ResultSchema);

const seedUsers = [
    { name: "John Admin", email: "admin@digifice.com", role: "admin", password: "password123" },
    { name: "Super Admin", email: "super@digifice.com", role: "admin", password: "password123" },

    // Lecturers
    { name: "Jane Lecturer", email: "lecturer@digifice.com", role: "lecturer", password: "password123" },
    { name: "Dr. Alan Grant", email: "alan@digifice.com", role: "lecturer", password: "password123" },
    { name: "Prof. Sarah Connor", email: "sarah@digifice.com", role: "lecturer", password: "password123" },
    { name: "Dr. Henry Wu", email: "henry@digifice.com", role: "lecturer", password: "password123" },
    { name: "Prof. Ian Malcolm", email: "ian@digifice.com", role: "lecturer", password: "password123" },
    { name: "Dr. Ellie Sattler", email: "ellie@digifice.com", role: "lecturer", password: "password123" },

    // Students
    { name: "Alice Student", email: "alice@digifice.com", role: "student", password: "password123" },
    { name: "Bob Student", email: "bob@digifice.com", role: "student", password: "password123" },
    { name: "Charlie Brown", email: "charlie@digifice.com", role: "student", password: "password123" },
    { name: "Diana Prince", email: "diana@digifice.com", role: "student", password: "password123" },
    { name: "Evan Wright", email: "evan@digifice.com", role: "student", password: "password123" },
    { name: "Fiona Apple", email: "fiona@digifice.com", role: "student", password: "password123" },
    { name: "George Michael", email: "george@digifice.com", role: "student", password: "password123" },
    { name: "Hannah Montana", email: "hannah@digifice.com", role: "student", password: "password123" },
    { name: "Ivan Drago", email: "ivan@digifice.com", role: "student", password: "password123" },
    { name: "Jack Sparrow", email: "jack@digifice.com", role: "student", password: "password123" },
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clean Database
        console.log("Cleaning Database...");
        await Result.deleteMany({});
        await Module.deleteMany({});
        await DegreeProgram.deleteMany({});
        await Department.deleteMany({});
        await Faculty.deleteMany({});
        await User.deleteMany({});
        console.log("Database Cleaned.");

        // 1. Seed Faculty
        console.log("Seeding Faculty...");
        const computingFaculty = await Faculty.create({ name: "Faculty of Computing" });
        const businessFaculty = await Faculty.create({ name: "Faculty of Business" });
        const engineeringFaculty = await Faculty.create({ name: "Faculty of Engineering" });

        // 2. Seed Departments
        console.log("Seeding Departments...");
        const seDept = await Department.create({ name: "Software Engineering", faculty: computingFaculty._id });
        const netDept = await Department.create({ name: "Computer Networks", faculty: computingFaculty._id });
        const csDept = await Department.create({ name: "Computer Science", faculty: computingFaculty._id });

        const bizDept = await Department.create({ name: "Business Management", faculty: businessFaculty._id });
        const accDept = await Department.create({ name: "Accounting", faculty: businessFaculty._id });

        const civilDept = await Department.create({ name: "Civil Engineering", faculty: engineeringFaculty._id });

        // 3. Seed Degree Programs
        console.log("Seeding Degrees...");
        const bscSE = await DegreeProgram.create({ name: "BSc (Hons) Software Engineering", department: seDept._id });
        const bscNet = await DegreeProgram.create({ name: "BSc (Hons) Computer Networks", department: netDept._id });
        const bscCS = await DegreeProgram.create({ name: "BSc (Hons) Computer Science", department: csDept._id });

        const bba = await DegreeProgram.create({ name: "Bachelor of Business Administration", department: bizDept._id });
        const bscAcc = await DegreeProgram.create({ name: "BSc Accounting", department: accDept._id });

        const bscCivil = await DegreeProgram.create({ name: "BSc Civil Engineering", department: civilDept._id });

        // 4. Seed Modules
        console.log("Seeding Modules...");
        const seModules = [
            { name: "Introduction to Programming", code: "SE101", credits: 4, semester: "Sem 1", degreeProgram: bscSE._id },
            { name: "Computer Systems", code: "SE103", credits: 3, semester: "Sem 1", degreeProgram: bscSE._id },

            { name: "Web Development", code: "SE102", credits: 3, semester: "Sem 2", degreeProgram: bscSE._id },
            { name: "Database Systems I", code: "SE104", credits: 4, semester: "Sem 2", degreeProgram: bscSE._id },
            { name: "Object Oriented Programming", code: "SE105", credits: 4, semester: "Sem 2", degreeProgram: bscSE._id },

            { name: "Data Structures", code: "SE201", credits: 4, semester: "Sem 3", degreeProgram: bscSE._id },
            { name: "Software Engineering Principles", code: "SE202", credits: 3, semester: "Sem 3", degreeProgram: bscSE._id },

            { name: "Operating Systems", code: "SE203", credits: 4, semester: "Sem 4", degreeProgram: bscSE._id },
            { name: "Requirement Engineering", code: "SE204", credits: 3, semester: "Sem 4", degreeProgram: bscSE._id },

            { name: "Software Architecture", code: "SE301", credits: 4, semester: "Sem 5", degreeProgram: bscSE._id },
            { name: "Human Computer Interaction", code: "SE302", credits: 3, semester: "Sem 5", degreeProgram: bscSE._id },

            { name: "Distributed Systems", code: "SE303", credits: 4, semester: "Sem 6", degreeProgram: bscSE._id },
            { name: "Quality Assurance", code: "SE304", credits: 3, semester: "Sem 6", degreeProgram: bscSE._id },

            { name: "Cloud Computing", code: "SE401", credits: 4, semester: "Sem 7", degreeProgram: bscSE._id },
            { name: "Final Year Project I", code: "SE402", credits: 6, semester: "Sem 7", degreeProgram: bscSE._id },

            { name: "Final Year Project II", code: "SE403", credits: 6, semester: "Sem 8", degreeProgram: bscSE._id },
        ];

        const netModules = [
            { name: "Network Fundamentals", code: "CN101", credits: 4, semester: "Sem 1", degreeProgram: bscNet._id },
            { name: "IT Essentials", code: "CN102", credits: 3, semester: "Sem 1", degreeProgram: bscNet._id },

            { name: "Routing and Switching", code: "CN201", credits: 4, semester: "Sem 2", degreeProgram: bscNet._id },
            { name: "Server Administration", code: "CN202", credits: 4, semester: "Sem 2", degreeProgram: bscNet._id },

            { name: "Network Security", code: "CN301", credits: 4, semester: "Sem 5", degreeProgram: bscNet._id },
            { name: "Wireless Networks", code: "CN302", credits: 3, semester: "Sem 5", degreeProgram: bscNet._id },

            { name: "Cyber Security", code: "CN401", credits: 4, semester: "Sem 7", degreeProgram: bscNet._id },
        ];

        const csModules = [
            { name: "Introduction to CS", code: "CS101", credits: 4, semester: "Sem 1", degreeProgram: bscCS._id },
            { name: "Mathematics for Computing", code: "CS102", credits: 3, semester: "Sem 1", degreeProgram: bscCS._id },

            { name: "Digital Interpretation", code: "CS103", credits: 3, semester: "Sem 2", degreeProgram: bscCS._id },

            { name: "Algorithms", code: "CS201", credits: 4, semester: "Sem 3", degreeProgram: bscCS._id },
            { name: "Computer Graphics", code: "CS202", credits: 3, semester: "Sem 3", degreeProgram: bscCS._id },

            { name: "Artificial Intelligence", code: "CS301", credits: 4, semester: "Sem 5", degreeProgram: bscCS._id },
            { name: "Machine Learning", code: "CS302", credits: 4, semester: "Sem 5", degreeProgram: bscCS._id },

            { name: "Data Science", code: "CS401", credits: 4, semester: "Sem 7", degreeProgram: bscCS._id },
        ];

        const bizModules = [
            { name: "Principles of Management", code: "BM101", credits: 3, semester: "Sem 1", degreeProgram: bba._id },
            { name: "Marketing Basics", code: "BM102", credits: 3, semester: "Sem 1", degreeProgram: bba._id },
            { name: "Financial Accounting", code: "BM103", credits: 3, semester: "Sem 2", degreeProgram: bba._id },
            { name: "Business Law", code: "BM104", credits: 3, semester: "Sem 2", degreeProgram: bba._id },
            { name: "HR Management", code: "BM201", credits: 3, semester: "Sem 3", degreeProgram: bba._id },
            { name: "Organizational Behavior", code: "BM202", credits: 3, semester: "Sem 3", degreeProgram: bba._id },
        ];

        const accModules = [
            { name: "Financial Accounting I", code: "ACC101", credits: 3, semester: "Sem 1", degreeProgram: bscAcc._id },
            { name: "Microeconomics", code: "ACC102", credits: 3, semester: "Sem 1", degreeProgram: bscAcc._id },
            { name: "Management Accounting", code: "ACC201", credits: 3, semester: "Sem 3", degreeProgram: bscAcc._id },
            { name: "Taxation", code: "ACC202", credits: 3, semester: "Sem 3", degreeProgram: bscAcc._id },
            { name: "Auditing", code: "ACC301", credits: 3, semester: "Sem 5", degreeProgram: bscAcc._id },
        ];

        const civilModules = [
            { name: "Engineering Mechanics", code: "CE101", credits: 4, semester: "Sem 1", degreeProgram: bscCivil._id },
            { name: "Engineering Drawing", code: "CE102", credits: 3, semester: "Sem 1", degreeProgram: bscCivil._id },
            { name: "Structural Analysis", code: "CE201", credits: 4, semester: "Sem 3", degreeProgram: bscCivil._id },
            { name: "Fluid Mechanics", code: "CE202", credits: 4, semester: "Sem 3", degreeProgram: bscCivil._id },
            { name: "Geotechnical Engineering", code: "CE301", credits: 4, semester: "Sem 5", degreeProgram: bscCivil._id },
        ];

        await Module.insertMany([
            ...seModules, ...netModules, ...csModules,
            ...bizModules, ...accModules, ...civilModules
        ]);
        console.log("Modules seeded.");

        // 5. Seed Users
        console.log("Seeding Users...");
        for (const user of seedUsers) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await User.create({ ...user, password: hashedPassword });
        }
        console.log("Users seeded.");

        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seed();
