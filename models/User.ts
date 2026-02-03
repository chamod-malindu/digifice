import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
    name: { type: String, required: [true, "Name is required"] },
    email: { type: String, required: [true, "Email is required"], unique: true },
    password: { type: String, required: [true, "Password is required"] },
    image: { type: String },
    role: {
        type: String,
        enum: ['student', 'lecturer', 'admin'],
        default: 'student',
    },
    adminType: {
        type: String,
        enum: ['super_admin', 'medical_officer', 'exam_admin'],
        required: false
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: false,
    },
    degreeProgram: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DegreeProgram',
        required: false,
    },
    academicYear: {
        type: Number,
        enum: [1, 2, 3, 4],
        default: 1
    },
    semester: {
        type: Number,
        enum: [1, 2],
        default: 1
    },
    bulkUploadBatch: { type: String, required: false }, // Format: batch_TIMESTAMP
}, { timestamps: true });

const User = models.User || model('User', UserSchema);

export default User;
