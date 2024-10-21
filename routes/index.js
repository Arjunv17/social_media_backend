const express = require('express');
const router = express.Router();

// Import your individual route files
const userRoutes = require('./user');
const postRoutes = require('./posts');
const commentRoutes = require('./comment');
const likeRoutes = require('./like');
const friendsRoutes = require('./friendrequest');

// Use the user routes under the `/user` endpoint
router.use('/user', userRoutes);


// Use the post routes under the `/post` endpoint
router.use('/post', postRoutes);


// Use the comment routes under the `/comment` endpoint
router.use('/comment', commentRoutes);


// Use the like routes under the `/like` endpoint
router.use('/like', likeRoutes);


// Use the friends routes under the `/friends` endpoint
router.use('/friend', friendsRoutes);


module.exports = router; // Export the combined router
