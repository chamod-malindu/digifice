import mongoose from 'mongoose';

const ModuleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a module name'],
    },
    code: {
        type: String,
        required: [true, 'Please provide a module code'],
        unique: true,
    },
    credits: {
        type: Number,
        required: [true, 'Please provide module credits'],
        min: 1,
    },
    semester: {
        type: String,
        required: [true, 'Please provide a semester'],
        enum: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'],
    },
    degreeProgram: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DegreeProgram',
        required: false, // Optional for now to avoid breaking existing seeds, but ideally required
    },
    leader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
}, { timestamps: true });

export default mongoose.models.Module || mongoose.model('Module', ModuleSchema);
