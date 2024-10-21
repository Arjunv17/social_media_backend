const mongoose = require('mongoose');

const FriendRequestSchema = new mongoose.Schema({
    req_sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    req_receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    is_active: { type: Boolean, default: false },
}, 
{ timestamps: true, versionKey: false });

const FriendRequest = mongoose.model('friendrequests', FriendRequestSchema);

// Create FriendRequest Indexes
const createFriendsIndexes = async () => {
    try {
        await FriendRequest.collection.createIndex({ req_sender_id: 1 });
        await FriendRequest.collection.createIndex({ req_receiver_id: 1 });
        await FriendRequest.collection.createIndex({ status: 1 });
    } catch (error) {
        console.error("Error creating friendrequests indexes:", error);
    }
};

module.exports = { FriendRequest, createFriendsIndexes };

