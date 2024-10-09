// Add Models
const mongoose = require('mongoose');
const { findOne, upsert } = require('../helpers');
const { Post } = require('../models/Post');
const { successResponse, errorResponse } = require('../utils/response');
const { validatePost } = require('../validations/posts');



// Save Post 
const savePost = async (req, res) => {
    const { content, likes, comments_count } = req.body;
    try {
        // Image File
        let attachment = req.file ? req.file.originalname : null;
        // Validate Post
        const postValidation = validatePost({ content, likes: likes ? likes : 0, comments_count: comments_count ? comments_count : 0 });
        if (postValidation.error) {
            return errorResponse(res, 404, postValidation.error.message)
        }

        // Create new post
        const newPost = new Post({
            content,
            likes: likes ? likes : 0,
            comments_count: comments_count ? comments_count : 0,
            user_id: req.user && req.user.id ? req.user.id : null, // Ensure this is valid
            attachments: attachment
        });

        // Save response
        let saveRes = await newPost.save();
        return successResponse(res, 200, saveRes)



    } catch (error) {
        return errorResponse(res, 500, `Internal Server Error ${error.message}`)
    }
}

// Update Post 
const updatePost = async (req, res) => {
    const { content, likes, comments_count, id } = req.body;
    try {
        // Check if ID is provided
        if (!id) {
            return errorResponse(res, 400, "Post ID is required.");
        }

        // Fetch existing post
        let existingPost = await findOne(Post, { _id: new mongoose.Types.ObjectId(id) });
        
        // If post not found
        if (!existingPost) {
            return errorResponse(res, 404, "Post not found.");
        }

        // Construct payload
        let payload = {};

        if (content) payload.content = content; // Update content
        if (likes) payload.likes = existingPost.likes + Number(likes); // Update likes if provided
        if (comments_count) payload.comments_count = existingPost.comments_count + Number(comments_count); // Update comments_count if provided
        
        // Handle attachments if a file is uploaded
        if (req.file) {
            payload.attachments = req.file.originalname;
        }

        // Save Response
        let updateRes = await upsert(Post, existingPost._id, payload);
        return successResponse(res, 200, updateRes);

    } catch (error) {
        return errorResponse(res, 500, `Internal Server Error: ${error.message}`);
    }
};

module.exports = {
    savePost,
    updatePost
}