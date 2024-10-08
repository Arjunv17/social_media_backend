const express = require('express');
const router = express.Router();
const  upload  = require('../middlewares/multer')
const { saveUser , login,getalluser, updateUser, gettestuser } = require('../controllers/user');
const authentication = require('../middlewares/auth');

// User Routes
router.post('/save', upload.single('profile_image'), saveUser);
router.post('/login', login);
router.get('/getalluser', authentication, getalluser);
router.post('/update', upload.single('profile_image'), updateUser);




//Testing Queries
router.get('/gettestuser', gettestuser);

module.exports = router; // Corrected export