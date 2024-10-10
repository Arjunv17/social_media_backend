const express = require('express');
const router = express.Router();
const { saveComment, getComment, updateComment, deleteComment } = require('../controllers/comment');
const authentication = require('../middlewares/auth');

// Comment Routes
router.post('/save', authentication, saveComment);
router.get('/get', getComment);
router.post('/update', authentication, updateComment);
router.delete('/delete', authentication, deleteComment);

module.exports = router; // Corrected export