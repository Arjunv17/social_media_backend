let activeUsers = {};

const setupSocket = (io) => {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        // Add user to activeUsers when they come online
        socket.on('online', (userId) => {
            activeUsers[userId] = socket.id; // Store the userId with the corresponding socket ID
            console.log(userId, ' joined the chat');
            console.log('Active users:', activeUsers);
        });

        // Handle user going offline manually
        socket.on('offline', (userId) => {
            if (activeUsers[userId]) {
                delete activeUsers[userId]; // Remove the user from activeUsers when they go offline
                console.log(userId, ' went offline');
            }
            console.log('Active users:', activeUsers);
        });

        // Handle user disconnect
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
            // Find the userId associated with the disconnected socket ID
            const disconnectedUserId = Object.keys(activeUsers).find(
                (userId) => activeUsers[userId] === socket.id
            );
            if (disconnectedUserId) {
                delete activeUsers[disconnectedUserId]; // Remove the user from activeUsers
                console.log(`User ${disconnectedUserId} removed from active users`);
            }
            console.log('Active users:', activeUsers);
        });
    });
};

module.exports = { setupSocket };
