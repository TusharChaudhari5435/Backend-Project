import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
    Video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: true,
    },
    Comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    },
    tweet:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet',
    },
    likedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

export const Like = mongoose.model('Like', likeSchema);