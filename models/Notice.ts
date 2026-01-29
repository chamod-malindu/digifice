import mongoose, { Schema, model, models } from 'mongoose';

const NoticeSchema = new Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
    },
    content: {
        type: String,
        required: [true, "Content is required"],
    },
    moduleCode: { // Storing code is sometimes easier for display than just ID, or we can use ref
        type: String,
        required: true,
    },
    moduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
        required: true,
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    authorName: {
        type: String,
        required: false
    }
}, { timestamps: true });

const Notice = models.Notice || model('Notice', NoticeSchema);

export default Notice;
