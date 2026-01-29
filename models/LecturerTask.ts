import mongoose, { Schema, model, models } from 'mongoose';

const LecturerTaskSchema = new Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
    },
    date: {
        type: Date,
        required: true,
    },
    startTime: {
        type: String,
        required: true, // Format: HH:mm
    },
    endTime: {
        type: String,
        required: true, // Format: HH:mm
    },
    lecturerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['planned', 'completed', 'postponed'],
        default: 'planned',
    }
}, { timestamps: true });

const LecturerTask = models.LecturerTask || model('LecturerTask', LecturerTaskSchema);

export default LecturerTask;
