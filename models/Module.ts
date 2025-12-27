import mongoose from 'mongoose';

const ModuleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    credits: { type: Number, required: true },
    semester: { type: String, required: true },
    degreeProgram: { type: mongoose.Schema.Types.ObjectId, ref: 'DegreeProgram' }, // Hierarchy Link
}, { timestamps: true });

export default mongoose.models.Module || mongoose.model('Module', ModuleSchema);
