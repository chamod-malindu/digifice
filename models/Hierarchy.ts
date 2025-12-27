import mongoose from 'mongoose';

const FacultySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
});
export const Faculty = mongoose.models.Faculty || mongoose.model('Faculty', FacultySchema);

const DepartmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
});
export const Department = mongoose.models.Department || mongoose.model('Department', DepartmentSchema);

const DegreeProgramSchema = new mongoose.Schema({
    name: { type: String, required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
});
export const DegreeProgram = mongoose.models.DegreeProgram || mongoose.model('DegreeProgram', DegreeProgramSchema);
