const express = require('express');
const router = express.Router();

// Import your individual route files
const userRoutes = require('./user');
const postRoutes = require('./posts');
const commentRoutes = require('./comment');

// Use the user routes under the `/user` endpoint
router.use('/user', userRoutes);


// Use the post routes under the `/post` endpoint
router.use('/post', postRoutes);


// Use the post routes under the `/comment` endpoint
router.use('/comment', commentRoutes);



module.exports = router; // Export the combined router
