const mongoose = require('mongoose');
const { createPostIndexes } = require('../models/Post');
const { createCommentIndexes } = require('../models/Comment');
const { createFriendsIndexes } = require('../models/FriendRequest');

const connectDb = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.DBURL);
        console.log("Connected to MongoDB!");

        // Create indexes after connection
        await createPostIndexes();
        await createCommentIndexes();
        await createFriendsIndexes();

        console.log("Indexes created successfully!");

    } catch (error) {
        console.error("DB Connection or Index Creation Error:", error);
    }
};

module.exports = connectDb;
