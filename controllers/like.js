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
            return errorResponse(res, 400, likeValidation.error.message);
        }

        // Find existing Like and Post in parallel
        const [existingLike, existingPost] = await Promise.all([
            findOne(Likes, { post_id: new mongoose.Types.ObjectId(post_id), user_id: new mongoose.Types.ObjectId(user_id) }),
            findOne(Post, { _id: new mongoose.Types.ObjectId(post_id) })
        ]);

        // If post not found, return an error early
        if (!existingPost) {
            return errorResponse(res, 404, "Post not found.");
        }

        let payload = {};
        let message = '';

        if (!existingLike) {
            // If no like exists, create a new like and increment the post's like count
            const newLike = new Likes({
                user_id,
                post_id,
                is_active: true
            });
            await newLike.save();

            payload.likes = existingPost.likes + 1;
            message = 'Like Added Successfully!';
        } else if (existingLike.is_active) {
            // If the like exists and is active, remove it and decrement the post's like count
            await deleteOne(Likes, existingLike._id);

            payload.likes = existingPost.likes - 1;
            message = 'Like Removed Successfully!';
        } else {
            return errorResponse(res, 400, "Something went wrong with the like status.");
        }

        // Update the post's like count
        await upsert(Post, existingPost._id, payload);

        return successResponse(res, 200, { message, likes: payload.likes });
    } catch (error) {
        return errorResponse(res, 500, `Internal Server Error: ${error.message}`);
    }
};


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
        if (post_id) payload.likes = existingPost.likes - 1

        // Update Post Likes
        await upsert(Post, existingPost._id, payload)

        // Save Response
        let deleteRes = await deleteOne(Likes, existingLike._id);
        return successResponse(res, 200, { data: deleteRes, message: 'Like Removed Successfully!!' });

    } catch (error) {
        return errorResponse(res, 500, `Internal Server Error: ${error.message}`);
    }
};


const getLikes = async (req, res) => {
    try {
        const { user_id } = req.query;
        let likesArray = await Likes.aggregate([
            {
                $match: { user_id: new mongoose.Types.ObjectId(user_id) }
            }
        ])
        return successResponse(res, 200, { data: likesArray, message: 'Like Fetched Successfully!!' });

    } catch (error) {
        return errorResponse(res, 500, `Internal Server Error ${error.message}`)
    }
}

module.exports = {
    saveLike,
    deleteLike,
    getLikes
}