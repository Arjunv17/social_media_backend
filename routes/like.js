const express = require('express');
const router = express.Router();
const { saveLike, deleteLike,getLikes } = require('../controllers/like');
const authentication = require('../middlewares/auth');

// Likes Routes
router.post('/save', authentication, saveLike);
router.delete('/delete', authentication, deleteLike);
router.get('/get',authentication, getLikes);

module.exports = router; // Corrected export