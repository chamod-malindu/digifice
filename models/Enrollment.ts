import mongoose from 'mongoose';

const EnrollmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    module: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'dropped', 'completed'],
        default: 'active',
    },
    enrolledAt: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

// Prevent duplicate enrollments
EnrollmentSchema.index({ student: 1, module: 1 }, { unique: true });

export default mongoose.models.Enrollment || mongoose.model('Enrollment', EnrollmentSchema);
