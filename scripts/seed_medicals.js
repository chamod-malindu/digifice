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

// Minimal Schemas
const UserSchema = new mongoose.Schema({ name: String, email: String }, { strict: false });
const MedicalSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: String,
    reason: String,
    startDate: Date,
    endDate: Date,
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Medical = mongoose.models.Medical || mongoose.model('Medical', MedicalSchema);

async function seedMedicals() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        await Medical.deleteMany({}); // Clear existing

        // Find a student
        const student = await User.findOne({ role: 'student' });
        if (!student) {
            console.log("No student found to attach medicals to.");
            process.exit(1);
        }

        const medicals = [
            {
                student: student._id,
                status: 'pending',
                reason: 'Viral Fever',
                startDate: new Date('2025-01-10'),
                endDate: new Date('2025-01-15'),
            },
            {
                student: student._id,
                status: 'approved_by_officer',
                reason: 'Sprained Ankle',
                startDate: new Date('2025-02-01'),
                endDate: new Date('2025-02-03'),
                officerComments: "Rest recommended.",
            },
            {
                student: student._id,
                status: 'forwarded_to_dept',
                reason: 'Migraine',
                startDate: new Date('2025-03-05'),
                endDate: new Date('2025-03-06'),
                officerComments: "Valid.",
                adminComments: "Notified department head.",
            }
        ];

        await Medical.create(medicals);
        console.log("Seeded 3 medical records.");
        process.exit(0);

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

seedMedicals();
