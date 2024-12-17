const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }, // Corrected 'require' to 'required'
    post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'posts', required: true }, // Corrected 'require' to 'required'
    likes: { type: Number, required: false, default: 0 },
    comment_content: { type: String, required: false, default: '' },
    is_active: { type: Boolean, default: false },
}, 
{ timestamps: true, versionKey: false });

const Comment = mongoose.model('comments', CommentSchema);

// Create Post Indexes
const createCommentIndexes = async () => {
    try {
        await Comment.collection.createIndex({ user_id: 1, post_id: 1 });
    } catch (error) {
        console.error("Error creating Comment indexes:", error);
    }
};

module.exports = { Comment, createCommentIndexes };

