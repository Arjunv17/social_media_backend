// Add Models
const mongoose = require('mongoose');
const { Likes } = require('../models/Like');
const { successResponse, errorResponse } = require('../utils/response');
const { upsert, findOne, deleteOne } = require('../helpers');
const { validateLike } = require('../validations/like');
const { Post } = require('../models/Post');



// Save Likes 
const saveLike = async (req, res) => {
    try {
        const { user_id, post_id } = req.body;

        // Validate Like
        const likeValidation = validateLike({ user_id, post_id });
        if (likeValidation.error) {
            return errorResponse(res, 404, likeValidation.error.message)
        }

        // Create new Like
        const newComment = new Likes({
            user_id,
            post_id
        });

        // Save response
        let saveRes = await newComment.save();
        return successResponse(res, 200, saveRes);

    } catch (error) {
        return errorResponse(res, 500, `Internal Server Error ${error.message}`)
    }
}

// Delete Like 
const deleteLike = async (req, res) => {
    const { id, post_id } = req.body;
    try {
        // Check if ID is provided
        if (!id) {
            return errorResponse(res, 400, "Like ID is required.");
        }

        // Fetch existing comment
        let existingLike = await findOne(Likes, { _id: new mongoose.Types.ObjectId(id) });
        let existingPost = await findOne(Post, { _id: new mongoose.Types.ObjectId(existingLike.post_id) });

        // If Like not found
        if (!existingLike) {
            return errorResponse(res, 404, "Like not found.");
        }
        // If post not found
        if (!existingPost) {
            return errorResponse(res, 404, "Post not found.");
        }

        let payload = {};
        if(post_id) payload.likes = existingPost.likes - 1

        // Update Post Likes
        await upsert(Post, existingPost._id, payload)

        // Save Response
        let deleteRes = await deleteOne(Likes, existingLike._id);
        return successResponse(res, 200, { data: deleteRes, message: 'Like Removed Successfully!!' });

    } catch (error) {
        return errorResponse(res, 500, `Internal Server Error: ${error.message}`);
    }
};


// const getComment = async (req, res) => {
//     try {
//         console.log(req.body,">>>>>>>req.body>>>>>>")

//     } catch (error) {
//         return errorResponse(res, 500, `Internal Server Error ${error.message}`)
//     }
// }

module.exports = {
    saveLike,
    deleteLike,
    // getComment
}