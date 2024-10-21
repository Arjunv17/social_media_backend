let activeUsers = {};

const setupSocket = (io) => {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);
        // Handle user disconnect
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
            Object.keys(activeUsers).forEach((userId) => {
                if (activeUsers[userId] === socket.id) {
                    delete activeUsers[userId];
                }
            });
        });
    });
};

module.exports = { setupSocket };
