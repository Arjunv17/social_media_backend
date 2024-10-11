// Add Models
const mongoose = require('mongoose');
const { Comment } = require('../models/Comment');
const { successResponse, errorResponse } = require('../utils/response');
const { validateComment } = require('../validations/comment');
const { upsert, findOne, deleteOne } = require('../helpers');
const { Post } = require('../models/Post');



// Save Comment 
const saveComment = async (req, res) => {
    try {
        const { user_id, post_id, likes, comment_content } = req.body;

        // Validate Comment
        const commentValidation = validateComment({ user_id, post_id, comment_content, likes: likes ? likes : 0 });
        if (commentValidation.error) {
            return errorResponse(res, 404, commentValidation.error.message)
        }

        // Create new Comment
        const newComment = new Comment({
            user_id,
            post_id,
            likes: likes ? likes : 0,
            comment_content
        });

        let findPost = await findOne(Post, { _id: new mongoose.Types.ObjectId(post_id) });
        // If post not found
        if (!findPost) {
            return errorResponse(res, 404, "Post not found.");
        }

        let payload = {};
        if (post_id) payload.comments_count = findPost.comments_count + 1;

        // Update post Comment Count 
        await upsert(Post, findPost._id, payload)

        // Save response
        let saveRes = await newComment.save();
        return successResponse(res, 200, saveRes);

    } catch (error) {
        return errorResponse(res, 500, `Internal Server Error ${error.message}`)
    }
}

// Update Comment 
const updateComment = async (req, res) => {
    const { user_id, post_id, likes, comment_content, id } = req.body;
    try {
        // Check if ID is provided
        if (!id) {
            return errorResponse(res, 400, "Comment ID is required.");
        }

        // Fetch existing comment
        let existingComment = await findOne(Comment, { _id: new mongoose.Types.ObjectId(id) });

        // If post not found
        if (!existingComment) {
            return errorResponse(res, 404, "Comment not found.");
        }

        // Construct payload
        let payload = {};

        if (user_id) payload.user_id = user_id; // Update content
        if (post_id) payload.post_id = post_id; // Update content
        if (likes) payload.likes = existingComment.likes + Number(likes); // Update likes if provided
        if (comment_content) payload.comment_content = comment_content; // Update comment_content if provided

        // Save Response
        let updateRes = await upsert(Comment, existingComment._id, payload);
        return successResponse(res, 200, updateRes);

    } catch (error) {
        return errorResponse(res, 500, `Internal Server Error: ${error.message}`);
    }
};


const getComment = async (req, res) => {
    try {
        console.log(req.body, ">>>>>>>req.body>>>>>>")

    } catch (error) {
        return errorResponse(res, 500, `Internal Server Error ${error.message}`)
    }
}

// Delete Comment 
const deleteComment = async (req, res) => {
    const { id, post_id } = req.body;
    try {
        // Check if ID is provided
        if (!id) {
            return errorResponse(res, 400, "Comment ID is required.");
        }

        // Fetch existing comment
        let existingComment = await findOne(Comment, { _id: new mongoose.Types.ObjectId(id) });
        // If Comment not found
        if (!existingComment) {
            return errorResponse(res, 404, "Comment not found.");
        }

        // Fetch existing comment
        let existingPost = await findOne(Post, { _id: new mongoose.Types.ObjectId(post_id) });
        // If post not found
        if (!existingPost) {
            return errorResponse(res, 404, "Post not found.");
        }
        let payload = {};
        if (post_id) payload.comments_count = existingPost.comments_count - 1;
        
        // Update Post Comment
        await upsert(Post, existingPost._id, payload)

        // Save Response
        let deleteRes = await deleteOne(Comment, existingComment._id);
        return successResponse(res, 200, { data: deleteRes, message: 'Comment Deleted Successfully!!' });

    } catch (error) {
        return errorResponse(res, 500, `Internal Server Error: ${error.message}`);
    }
};


module.exports = {
    saveComment,
    updateComment,
    getComment,
    deleteComment
}