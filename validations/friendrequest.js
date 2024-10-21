const Joi = require('joi');
const  mongoose = require('mongoose');

// Custom Joi validation for ObjectId
const objectId = Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message(`Invalid ObjectId: ${value}`);
    }
    return value;  // If valid, return the value
}, 'ObjectId validation');


const friendRequestSchema = Joi.object({
    req_sender_id: objectId.required(),
    req_receiver_id: objectId.required(),
    status: Joi.string().required()
})


const validateFriendRequest = (friends) => {
    return friendRequestSchema.validate(friends)
}


module.exports = {
    validateFriendRequest
}