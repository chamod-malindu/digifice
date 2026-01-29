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

// Schemas (Minimal definitions needed for seeding)
const UserSchema = new mongoose.Schema({
    name: String, email: String, role: String
}, { strict: false });

const ModuleSchema = new mongoose.Schema({
    name: String, code: String, leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Module = mongoose.models.Module || mongoose.model('Module', ModuleSchema);

async function seedLecturer() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Create or Find Lecturer
        let lecturer = await User.findOne({ email: 'lecturer@digifice.com' });
        if (!lecturer) {
            console.log("Creating new lecturer...");
            lecturer = await User.create({
                name: "Dr. Adam Smith",
                email: "lecturer@digifice.com",
                password: "password", // Should be hashed in real app
                role: "lecturer",
                image: "/avatars/03.png"
            });
        }
        console.log(`Lecturer: ${lecturer.name} (${lecturer._id})`);

        // 2. Assign Modules
        // Let's assign some CS modules to this lecturer
        const moduleCodes = ["CS101", "CS102", "CS201", "SE201"];

        const updateResult = await Module.updateMany(
            { code: { $in: moduleCodes } },
            { $set: { leader: lecturer._id } }
        );

        console.log(`Assigned ${updateResult.modifiedCount} modules to ${lecturer.name}.`);
        process.exit(0);

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

seedLecturer();
