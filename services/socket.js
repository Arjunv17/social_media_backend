const mongoose = require('mongoose');
const userModel = require('../models/user');
const { upsert, findOne } = require('../helpers');
let activeUsers = {};

const setupSocket = (io) => {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        // When a user comes online
        socket.on('online', async (userId) => {
            if (!userId || userId === 'null') {
                console.log('Invalid userId received for online event.');
                return;
            }

            activeUsers[userId] = socket.id; // Map userId to socket ID

            const exists = await findOne(userModel, { _id: new mongoose.Types.ObjectId(userId) });
            if (exists) {
                const payload = { status: 'online' };
                await upsert(userModel, exists._id, payload); // Update user status in DB
            }

            console.log('Active users:', activeUsers);

            // Broadcast updated status to all connected clients
            io.emit('statusChange', { userId, status: 'online' });
        });

        // When a user manually goes offline (e.g., logs out)
        socket.on('offline', async (userId) => {
            if (activeUsers[userId]) {
                delete activeUsers[userId]; // Remove the user from activeUsers

                const exists = await findOne(userModel, { _id: new mongoose.Types.ObjectId(userId) });
                if (exists) {
                    const payload = { status: 'offline' };
                    await upsert(userModel, exists._id, payload);
                }

                console.log(`${userId} went offline`);

                // Broadcast updated status to all connected clients
                io.emit('statusChange', { userId, status: 'offline' });
            }
        });

        // Handle like event
        socket.on('like', (data) => {
            const message = data?.message;
            io.emit('likeresponse', { message });
        });



        // Handle Comment event
        socket.on('comment', (data) => {
            const { pId, commentData } = data;
            console.log(pId, commentData , ">>>>>>>>>>>>>>>>")
            io.emit('commentresponse', { commentData, pId });
        });



        // When the user disconnects (closes tab or loses connection)
        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${socket.id}`);

            // Find the user associated with this socket ID
            const disconnectedUserId = Object.keys(activeUsers).find((userId) => activeUsers[userId] === socket.id);

            // Remove null or invalid users (cleanup)
            Object.keys(activeUsers).forEach((userId) => {
                if (!userId || userId == 'null') {
                    delete activeUsers[userId];
                }
            });

            if (disconnectedUserId) {
                delete activeUsers[disconnectedUserId]; // Remove from activeUsers

                const exists = await findOne(userModel, { _id: new mongoose.Types.ObjectId(disconnectedUserId) });
                if (exists) {
                    const payload = { status: 'offline' };
                    await upsert(userModel, exists._id, payload);
                }

                console.log(`User ${disconnectedUserId} removed from active users`);

                // Broadcast updated status to all connected clients
                io.emit('statusChange', { userId: disconnectedUserId, status: 'offline' });
            }
        });
    });
};

module.exports = { setupSocket };
