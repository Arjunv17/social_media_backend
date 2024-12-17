const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }, // Corrected 'require' to 'required'
    content: { type: String, required: false, default: '' },
    attachments: { type: String, required: false, default: '' },
    likes: { type: Number, required: false, default: 0 },
    comments_count: { type: Number, required: false, default: 0 },
    is_active: { type: Boolean, default: false },
},
    { timestamps: true, versionKey: false });

const Post = mongoose.model('posts', PostSchema);

// Create Post Indexes
const createPostIndexes = async () => {
    try {
        await Post.collection.createIndex({ user_id: 1, likes: 1, comments_count: 1, createdAt: 1 });
    } catch (error) {
        console.error("Error creating Post indexes:", error);
    }
};

module.exports = { Post, createPostIndexes };

