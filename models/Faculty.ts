import mongoose from 'mongoose';

const FacultySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a faculty name'],
        unique: true,
    },
}, { timestamps: true });

export default mongoose.models.Faculty || mongoose.model('Faculty', FacultySchema);
