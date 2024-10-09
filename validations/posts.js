const Joi = require('joi');


const postSchema = Joi.object({
    content: Joi.string().required(),
    likes: Joi.number().optional(),
    comments_count: Joi.number().optional(),

})


const validatePost = (post) => {
    return postSchema.validate(post)
}


module.exports = {
    validatePost
}