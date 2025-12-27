import mongoose from 'mongoose';

const ResultSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    moduleName: { type: String, required: true },
    moduleCode: { type: String, required: true },
    semester: { type: String, required: true },
    type: { type: String, enum: ['Exam', 'Assignment', 'Project', 'Quiz'], required: true },
    marks: { type: Number, required: true },
    grade: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Result || mongoose.model('Result', ResultSchema);
