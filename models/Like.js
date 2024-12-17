const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }, // Corrected 'require' to 'required'
    post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'posts', required: true }, // Corrected 'require' to 'required'
    is_active: { type: Boolean, default: false },
}, 
{ timestamps: true, versionKey: false });

const Likes = mongoose.model('likes', LikeSchema);

// Create Post Indexes
const createLikeIndexes = async () => {
    try {
        await Likes.collection.createIndex({ user_id: 1, post_id: 1  });
    } catch (error) {
        console.error("Error creating likes indexes:", error);
    }
};

module.exports = { Likes, createLikeIndexes };

