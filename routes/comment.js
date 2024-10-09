const express = require('express');
const router = express.Router();
const { saveComment } = require('../controllers/comment');
const authentication = require('../middlewares/auth');

// Comment Routes
router.post('/save', authentication, saveComment);
// router.post('/update', authentication , upload.single('attachments'), updatePost);

module.exports = router; // Corrected export