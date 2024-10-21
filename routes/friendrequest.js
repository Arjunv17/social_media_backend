const express = require('express');
const router = express.Router();
const { sentRequest, getFriendRequest, updateRequest } = require('../controllers/friendrequest');
const authentication = require('../middlewares/auth');

// Friend Request Routes
router.post('/sendrequest', authentication, sentRequest);
router.get('/getrequest', authentication, getFriendRequest);
router.post('/updatestatus', authentication, updateRequest);


module.exports = router; // Corrected export