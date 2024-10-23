const mongoose = require('mongoose');
const userModel = require('../models/user');
const { upsert, findOne } = require('../helpers');
let activeUsers = {};

const setupSocket = (io) => {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        // When a user comes online
        socket.on('online', async (userId) => {
            activeUsers[userId] = socket.id; // Map userId to socket ID
            let exists = await findOne(userModel, { _id: new mongoose.Types.ObjectId(userId) });
            let payload = {};
            if (exists) payload.status = 'online';
            await upsert(userModel, exists._id, payload); // Update user status in DB
            console.log('Active users:', activeUsers);

            // Broadcast updated status to all connected clients
            io.emit('statusChange', { userId, status: 'online' });
        });

        // When a user manually goes offline (e.g., logs out)
        socket.on('offline', async (userId) => {
            if (activeUsers[userId]) {
                delete activeUsers[userId]; // Remove the user from activeUsers
                let exists = await findOne(userModel, { _id: new mongoose.Types.ObjectId(userId) });
                let payload = {};
                if (exists) payload.status = 'offline';
                await upsert(userModel, exists._id, payload);
                console.log(`${userId} went offline`);

                // Broadcast updated status to all connected clients
                io.emit('statusChange', { userId, status: 'offline' });
            }
        });

        // When the user disconnects (closes tab or loses connection)
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
            const disconnectedUserId = Object.keys(activeUsers).find(
                (userId) => activeUsers[userId] === socket.id
            );
            if (disconnectedUserId) {
                delete activeUsers[disconnectedUserId]; // Remove from activeUsers
                console.log(`User ${disconnectedUserId} removed from active users`);

                // Broadcast updated status to all connected clients
                io.emit('statusChange', { userId: disconnectedUserId, status: 'offline' });
            }
        });
    });
};

module.exports = { setupSocket };
