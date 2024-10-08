const express = require('express');
const router = express.Router();

// Import your individual route files
const userRoutes = require('./user');

// Use the user routes under the `/user` endpoint
router.use('/user', userRoutes);


module.exports = router; // Export the combined router
