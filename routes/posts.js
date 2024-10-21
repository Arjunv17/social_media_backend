const express = require('express');
const router = express.Router();
const  upload  = require('../middlewares/multer')
const { savePost , updatePost, getPostLikeAndComments, getPosts } = require('../controllers/posts');
const authentication = require('../middlewares/auth');

// Post Routes
router.post('/save', authentication , upload.single('attachments'), savePost);
router.post('/update', authentication , upload.single('attachments'), updatePost);
router.get('/posts_like_comment', authentication, getPostLikeAndComments);
router.get('/posts', authentication, getPosts);

// router.post('/login', login);
// router.post('/update', upload.single('profile_image'), updateUser);


module.exports = router; // Corrected export