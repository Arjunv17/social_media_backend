// Add Models
const mongoose = require('mongoose');
const { successResponse, errorResponse } = require('../utils/response');
const { upsert, findOne } = require('../helpers');
const { FriendRequest } = require('../models/FriendRequest');
const { validateFriendRequest } = require('../validations/friendrequest');
const userModel = require('../models/user')


// Sent Friend Request 
const sentRequest = async (req, res) => {
    try {
        const { req_sender_id, req_receiver_id, status } = req.body;
        console.log(req.body, "reqqqqqq")
        // Validate Friend Request
        const requestValidation = validateFriendRequest({ req_sender_id, req_receiver_id, status });
        if (requestValidation.error) {
            return errorResponse(res, 404, requestValidation.error.message)
        }

        // Create Send Request
        const newRequest = new FriendRequest({
            req_sender_id,
            req_receiver_id,
            status
        });

        // Save response
        let saveRes = await newRequest.save();
        return successResponse(res, 200, { data: saveRes, message: 'Request Sent!!' });

    } catch (error) {
        return errorResponse(res, 500, `Internal Server Error ${error.message}`)
    }
}

// Get Friend Request 
const getFriendRequest = async (req, res) => {
    try {
        let userId = req.user ? req.user.id : null;

        if (!userId) {
            return errorResponse(res, 400, "User ID is required");
        }

        // Find pending friend requests where the authenticated user is either the sender or the receiver
        let [existRequest] = await FriendRequest.aggregate([
            {
                $facet: {
                    sender: [
                        {
                            $match: { 
                                status: 'pending', 
                                req_receiver_id: new mongoose.Types.ObjectId(userId) 
                            }
                        },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'req_sender_id',
                                foreignField: '_id',
                                as: 'senderDetails'
                            }
                        },
                        {
                            $unwind: {
                                path: '$senderDetails',
                                preserveNullAndEmptyArrays: false // Ensure only matched sender details are included
                            }
                        },
                        {
                            $project: {
                                fullname: { $concat: ['$senderDetails.first_name', ' ', '$senderDetails.last_name'] },
                                status: 1,
                                req_sender_id: 1,
                                req_receiver_id: 1,
                                sender_email: '$senderDetails.email',
                                sender_profile_image: '$senderDetails.profile_image'
                            }
                        }
                    ],
                    receiver: [
                        {
                            $match: { 
                                status: 'pending', 
                                req_sender_id: new mongoose.Types.ObjectId(userId) 
                            }
                        },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'req_receiver_id',
                                foreignField: '_id',
                                as: 'receiverDetails'
                            }
                        },
                        {
                            $unwind: {
                                path: '$receiverDetails',
                                preserveNullAndEmptyArrays: false // Ensure only matched receiver details are included
                            }
                        },
                        {
                            $project: {
                                fullname: { $concat: ['$receiverDetails.first_name', ' ', '$receiverDetails.last_name'] },
                                status: 1,
                                req_sender_id: 1,
                                req_receiver_id: 1,
                                receiver_email: '$receiverDetails.email',
                                receiver_profile_image: '$receiverDetails.profile_image'
                            }
                        }
                    ]
                }
            }
        ]);

        return successResponse(res, 200, { data: existRequest, message: "Request Fetched!" });

    } catch (error) {
        return errorResponse(res, 500, `Internal Server Error: ${error.message}`);
    }
};


// Update Status Request 
const updateRequest = async (req, res) => {
    try {
        const { status, id, req_sender_id, req_receiver_id } = req.body;

        // Check Request id
        if (!id) {
            return errorResponse(res, 404, 'Id is Required!!');
        }
        
        // Find Request
        let exists = await findOne(FriendRequest, { _id: new mongoose.Types.ObjectId(id) });
        if (!exists) {
            return errorResponse(res, 404, 'Request Not Found!!');
        }

        // Update Status
        let payload = {};
        if (status) payload.status = status;

        // Get Sender ID
        let sender = await findOne(userModel, { _id: new mongoose.Types.ObjectId(req_receiver_id) });
        if (!sender) {
            return errorResponse(res, 404, 'Sender Not Found!!');
        }

        let senderRequest = {};
        if (req_sender_id) {
            senderRequest.friends = sender.friends || []; // Ensure friends array exists
            senderRequest.friends.push(sender._id);
        }
        await upsert(userModel, sender._id, senderRequest);

        // Get Receiver ID
        let receiver = await findOne(userModel, { _id: new mongoose.Types.ObjectId(req_sender_id) });
        if (!receiver) {
            return errorResponse(res, 404, 'Receiver Not Found!!');
        }

        let receiverRequest = {};
        if (req_sender_id) {
            receiverRequest.friends = receiver.friends || []; // Ensure friends array exists
            receiverRequest.friends.push(receiver._id);
        }
        await upsert(userModel, receiver._id, receiverRequest);

        // Update response
        let updateStatus = await upsert(FriendRequest, exists._id, payload);
        return successResponse(res, 200, updateStatus);

    } catch (error) {
        return errorResponse(res, 500, `Internal Server Error ${error.message}`);
    }
};


// // Delete Like 
// const deleteLike = async (req, res) => {
//     const { id, post_id } = req.body;
//     try {
//         // Check if ID is provided
//         if (!id) {
//             return errorResponse(res, 400, "Like ID is required.");
//         }

//         // Fetch existing comment
//         let existingLike = await findOne(Likes, { _id: new mongoose.Types.ObjectId(id) });
//         let existingPost = await findOne(Post, { _id: new mongoose.Types.ObjectId(existingLike.post_id) });

//         // If Like not found
//         if (!existingLike) {
//             return errorResponse(res, 404, "Like not found.");
//         }
//         // If post not found
//         if (!existingPost) {
//             return errorResponse(res, 404, "Post not found.");
//         }

//         let payload = {};
//         if(post_id) payload.likes = existingPost.likes - 1

//         // Update Post Likes
//         await upsert(Post, existingPost._id, payload)

//         // Save Response
//         let deleteRes = await deleteOne(Likes, existingLike._id);
//         return successResponse(res, 200, { data: deleteRes, message: 'Like Removed Successfully!!' });

//     } catch (error) {
//         return errorResponse(res, 500, `Internal Server Error: ${error.message}`);
//     }
// };


module.exports = {
    sentRequest,
    getFriendRequest,
    updateRequest
}