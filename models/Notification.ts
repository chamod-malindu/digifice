import mongoose, { Schema, model, models } from 'mongoose';

const NotificationSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['info', 'success', 'warning', 'error'],
        default: 'info',
    },
    read: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const Notification = models.Notification || model('Notification', NotificationSchema);

export default Notification;
