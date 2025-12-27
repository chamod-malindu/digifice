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
}, { timestamps: true });

const User = models.User || model('User', UserSchema);

export default User;
