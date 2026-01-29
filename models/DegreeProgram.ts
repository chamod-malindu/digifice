import mongoose from 'mongoose';

const DegreeProgramSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a degree program name'],
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true,
    },
}, { timestamps: true });

export default mongoose.models.DegreeProgram || mongoose.model('DegreeProgram', DegreeProgramSchema);
