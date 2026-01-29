import mongoose, { Schema, model, models } from 'mongoose';

const ProfileRequestSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    requestedName: {
        type: String,
        required: false,
    },
    requestedPassword: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    adminComment: {
        type: String,
        required: false,
    }
}, { timestamps: true });

const ProfileRequest = models.ProfileRequest || model('ProfileRequest', ProfileRequestSchema);

export default ProfileRequest;
