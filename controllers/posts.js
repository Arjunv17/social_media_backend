// Add Models
const mongoose = require('mongoose');
const { findOne, upsert, findAll } = require('../helpers');
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
        return successResponse(res, 200, { data: saveRes, message: "Post saved successfully!!" })



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

const getPostLikeAndComments = async (req, res) => {
    const { post_id } = req.query;
    try {
        // Check Post Id Required
        if (!post_id) {
            return errorResponse(res, 400, "Post ID is required.");
        }

        // Get Post by like and comments
        let postArray = await Post.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(post_id) }
            },
            {
                $lookup: {
                    from: 'likes',
                    let: { postId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$post_id', '$$postId']
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'user_id',
                                foreignField: '_id',
                                as: 'user'
                            }
                        },
                        {
                            $unwind: {
                                path: '$user',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $project: {
                                fullname: { $concat: ['$user.first_name', " ", '$user.last_name'] },
                                profile: '$user.profile_image',
                            }
                        }
                    ],
                    as: 'Likes'
                }
            },
            {
                $lookup: {
                    from: 'comments',
                    let: { commentId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$post_id', '$$commentId']
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'user_id',
                                foreignField: '_id',
                                as: 'user'
                            }
                        },
                        {
                            $unwind: {
                                path: '$user',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $project: {
                                fullname: { $concat: ['$user.first_name', " ", '$user.last_name'] },
                                profile: '$user.profile_image',
                                comment_content: 1, // Include the comment content in the projection
                            }
                        }
                    ],
                    as: 'Comments'
                }
            }
        ]);

        // Send Response
        return successResponse(res, 200, postArray);
    } catch (error) {
        return errorResponse(res, 500, `Internal Server Error: ${error.message}`);
    }
}

const getPosts = async (req, res) => {
    const { filter, pageNumber = 1, pageSize = 10 } = req.query;
    try {
        // Convert pageNumber and pageSize to integers
        const page = parseInt(pageNumber);
        const limit = parseInt(pageSize);
        const skip = (page - 1) * limit;

        // Match content using regex for partial matching if a filter is provided
        const matchStage = filter
            ? { content: { $regex: filter, $options: 'i' } }
            : {};

        // Get total document count with filter
        // const totalDocuments = await Post.countDocuments(matchStage);

        // Get Posts with the filter, pagination, and user details
        const result = await Post.aggregate([
            {
                $match: matchStage // Match stage to filter posts
            },
            {
                $facet: {
                    totalCount: [
                        { $count: "totalDocuments" } // Count total matching documents
                    ],
                    paginatedData: [
                        { $sort: { createdAt: -1 } }, // Sort posts by creation date
                        { $skip: skip },             // Skip for pagination
                        { $limit: limit },           // Limit for pagination
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'user_id',
                                foreignField: '_id',
                                as: 'users'
                            }
                        },
                        {
                            $unwind: {
                                path: '$users',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $project: {
                                content: 1,
                                likes: 1,
                                comments_count: 1,
                                attachments: 1,
                                createdAt: 1,
                                updatedAt: 1,
                                fullname: { $concat: ['$users.first_name', " ", '$users.last_name'] }
                            }
                        }
                    ]
                }
            }
        ]);
        
        const totalDocuments = result[0].totalCount[0]?.totalDocuments || 0;
        const posts = result[0].paginatedData;
        

        // Send Response with total document count and paginated posts
        return successResponse(res, 200, {
            posts,
            totalDocuments,
            currentPage: page,
            pageSize: limit,
            message:'Post Fetched Successfully!!'
        });
    } catch (error) {
        return errorResponse(res, 500, `Internal Server Error: ${error.message}`);
    }
}

module.exports = {
    savePost,
    updatePost,
    getPostLikeAndComments,
    getPosts
}