const express = require('express');
const router = express.Router();
const  upload  = require('../middlewares/multer')
const { savePost , updatePost } = require('../controllers/posts');
const authentication = require('../middlewares/auth');

// Post Routes
router.post('/save', authentication , upload.single('attachments'), savePost);
router.post('/update', authentication , upload.single('attachments'), updatePost);

// router.post('/login', login);
// router.get('/getalluser', authentication, getalluser);
// router.post('/update', upload.single('profile_image'), updateUser);


module.exports = router; // Corrected export