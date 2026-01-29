import mongoose from 'mongoose';

const ResultSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    studentName: { // Denormalized for easier search/display if needed, but ref is primary
        type: String,
        required: false
    },
    moduleName: {
        type: String,
        required: [true, 'Please provide a module name'],
    },
    moduleCode: {
        type: String,
        required: [true, 'Please provide a module code'],
    },
    semester: {
        type: String,
        required: [true, 'Please provide a semester'],
        enum: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'],
    },
    type: {
        type: String,
        enum: ['Exam', 'Assignment', 'Project', 'Quiz'],
        default: 'Exam',
    },
    marks: {
        type: Number,
        required: [true, 'Please provide marks'],
        min: 0,
        max: 100,
    },
    grade: {
        type: String,
        required: [true, 'Please provide a grade'],
    },
    feedback: {
        type: String,
        required: false,
    },
}, { timestamps: true });

export default mongoose.models.Result || mongoose.model('Result', ResultSchema);
