// Add Models
const mongoose = require('mongoose');
const { findOne, upsert } = require('../helpers');
const { Comment } = require('../models/Comment');
const { successResponse, errorResponse } = require('../utils/response');
const { validateComment } = require('../validations/comment');



// Save Comment 
const saveComment = async (req, res) => {
    const { user_id, post_id, likes, comment_content } = req.body;
    try {
        console.log(req.body,">>>>>>>req.body>>>>>>")

        // Validate Comment
        const commentValidation = validateComment({ user_id, post_id, likes: likes ? likes : 0, comment_content });
        if (commentValidation.error) {
            return errorResponse(res, 404, commentValidation.error.message)
        }
        console.log(commentValidation,">>>>>>>commentValidation>>>>>>")

        // Create new Comment
        const newComment = new Comment({
            user_id,
            post_id,
            likes: likes ? likes : 0,
            comment_content
        });
        console.log(newComment,">>>>>>>newComment>>>>>>")

        // Save response
        let saveRes = await newComment.save();
        console.log(saveRes,">>>>>>>>>>>>>")
        return successResponse(res, 200, saveRes);

    } catch (error) {
        return errorResponse(res, 500, `Internal Server Error ${error.message}`)
    }
}

// Update Post 
// const updatePost = async (req, res) => {
//     const { content, likes, comments_count, id } = req.body;
//     try {
//         // Check if ID is provided
//         if (!id) {
//             return errorResponse(res, 400, "Post ID is required.");
//         }

//         // Fetch existing post
//         let existingPost = await findOne(Post, { _id: new mongoose.Types.ObjectId(id) });

//         // If post not found
//         if (!existingPost) {
//             return errorResponse(res, 404, "Post not found.");
//         }

//         // Construct payload
//         let payload = {};

//         if (content) payload.content = content; // Update content
//         if (likes) payload.likes = existingPost.likes + Number(likes); // Update likes if provided
//         if (comments_count) payload.comments_count = existingPost.comments_count + Number(comments_count); // Update comments_count if provided

//         // Handle attachments if a file is uploaded
//         if (req.file) {
//             payload.attachments = req.file.originalname;
//         }

//         // Save Response
//         let updateRes = await upsert(Post, existingPost._id, payload);
//         return successResponse(res, 200, updateRes);

//     } catch (error) {
//         return errorResponse(res, 500, `Internal Server Error: ${error.message}`);
//     }
// };

module.exports = {
    saveComment
}