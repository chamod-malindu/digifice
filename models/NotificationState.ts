import mongoose, { Schema, model, models } from 'mongoose';

const NotificationStateSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    dismissedIds: [{
        type: String,
    }],
    readIds: [{
        type: String,
    }],
}, { timestamps: true });

const NotificationState = models.NotificationState || model('NotificationState', NotificationStateSchema);

export default NotificationState;
