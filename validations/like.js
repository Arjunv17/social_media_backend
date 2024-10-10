const Joi = require('joi');
const  mongoose = require('mongoose');

// Custom Joi validation for ObjectId
const objectId = Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message(`Invalid ObjectId: ${value}`);
    }
    return value;  // If valid, return the value
}, 'ObjectId validation');


const likeSchema = Joi.object({
    user_id: objectId.required(),
    post_id: objectId.required()
})


const validateLike = (like) => {
    return likeSchema.validate(like)
}


module.exports = {
    validateLike
}