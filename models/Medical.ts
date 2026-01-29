import mongoose, { Schema, model, models } from 'mongoose';

const MedicalSchema = new Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved_by_officer', 'forwarded_to_dept', 'approved_by_dept', 'rejected'],
        default: 'pending',
    },
    reason: {
        type: String,
        required: [true, "Medical reason is required"],
    },
    startDate: {
        type: Date,
        required: [true, "Start date is required"],
    },
    endDate: {
        type: Date,
        required: [true, "End date is required"],
    },
    medicalCertificateUrl: {
        type: String, // In a real app, this would be a file path/URL
        default: "",
    },
    officerComments: {
        type: String,
        default: "",
    },
    adminComments: {
        type: String,
        default: '',
    },
    forwardedTo: { // The specific lecturer/staff member this request is forwarded to
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
}, { timestamps: true });

const Medical = models.Medical || model('Medical', MedicalSchema);

export default Medical;
