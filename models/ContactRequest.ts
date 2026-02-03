import mongoose from 'mongoose';

const ContactRequestSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
    },
    status: {
        type: String,
        enum: ['pending', 'read', 'replied'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.ContactRequest || mongoose.model('ContactRequest', ContactRequestSchema);
