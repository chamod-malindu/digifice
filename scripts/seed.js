const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const UserSchema = new mongoose.Schema({ /* simplified for seeding */ }, { strict: false });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const Module = mongoose.models.Module || mongoose.model('Module', new mongoose.Schema({}, { strict: false }));
const Faculty = mongoose.models.Faculty || mongoose.model('Faculty', new mongoose.Schema({}, { strict: false }));
const Department = mongoose.models.Department || mongoose.model('Department', new mongoose.Schema({}, { strict: false }));
const DegreeProgram = mongoose.models.DegreeProgram || mongoose.model('DegreeProgram', new mongoose.Schema({}, { strict: false }));

async function seed() {
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI is required');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Clean existing data
        await Promise.all([
            User.deleteMany({}),
            Module.deleteMany({}),
            Faculty.deleteMany({}),
            Department.deleteMany({}),
            DegreeProgram.deleteMany({})
        ]);

        // Create Faculty/Dept/Degree Hierarchy
        const science = await Faculty.create({ name: 'Faculty of Science' });
        const computing = await Faculty.create({ name: 'Faculty of Computing' });

        const csDept = await Department.create({ name: 'Computer Science', faculty: science._id });
        const seDept = await Department.create({ name: 'Software Engineering', faculty: computing._id });

        const csDegree = await DegreeProgram.create({ name: 'BSc Computer Science', department: csDept._id });
        const seDegree = await DegreeProgram.create({ name: 'BSc Software Engineering', department: seDept._id });

        // Create Modules
        await Module.create([
            { name: 'Intro to Programming', code: 'CS101', credits: 3, semester: 'Sem 1', degreeProgram: csDegree._id },
            { name: 'Data Structures', code: 'CS102', credits: 4, semester: 'Sem 2', degreeProgram: csDegree._id },
            { name: 'Software Arch', code: 'SE201', credits: 3, semester: 'Sem 3', degreeProgram: seDegree._id },
        ]);

        // Create Users
        const hashedPassword = await bcrypt.hash('password123', 10);
        const users = [
            { name: 'Admin User', email: 'admin@digifice.com', password: hashedPassword, role: 'admin' },
            { name: 'John Student', email: 'student@digifice.com', password: hashedPassword, role: 'student' },
            { name: 'Jane Lecturer', email: 'lecturer@digifice.com', password: hashedPassword, role: 'lecturer' },
        ];

        await User.insertMany(users);
        console.log('Seeding complete');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
