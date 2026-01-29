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
    bulkUploadBatch: { type: String, required: false }, // Format: batch_TIMESTAMP
}, { timestamps: true });

const User = models.User || model('User', UserSchema);

export default User;
