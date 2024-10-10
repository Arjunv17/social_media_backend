const express = require('express');
const router = express.Router();
const { saveLike, deleteLike } = require('../controllers/like');
const authentication = require('../middlewares/auth');

// Likes Routes
router.post('/save', authentication, saveLike);
router.delete('/delete', authentication, deleteLike);

// router.get('/get', getComment);

module.exports = router; // Corrected export