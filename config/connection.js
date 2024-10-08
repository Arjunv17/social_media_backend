const mongoose = require('mongoose');
// const { createContactIndexes } = require('../models/contacts');

const connectDb = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.DBURL);
        console.log("Connected to MongoDB!");

        // // Create indexes after connection
        // await createContactIndexes();
        
        // console.log("Indexes created successfully!");

    } catch (error) {
        console.error("DB Connection or Index Creation Error:", error);
    }
};

module.exports = connectDb;
