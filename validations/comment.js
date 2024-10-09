const Joi = require('joi');
const  mongoose = require('mongoose');

// Custom Joi validation for ObjectId
const objectId = Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message(`Invalid ObjectId: ${value}`);
    }
    return value;  // If valid, return the value
}, 'ObjectId validation');


const commentSchema = Joi.object({
    user_id: objectId.required(),
    post_id: objectId.required(),
    likes: Joi.number().optional(),
    comments_content: Joi.string().optional(),

})


const validateComment = (comment) => {
    return commentSchema.validate(comment)
}


module.exports = {
    validateComment
}