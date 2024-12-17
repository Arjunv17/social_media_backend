const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const routes = require('./routes/index');
const socketIo = require('socket.io');
const dbConnection = require('./config/connection');
require('dotenv').config();
const bootstrapAdmin = require('./utils/bootstrap');
const { setupSocket } = require('./services/socket');

const app = express();
const server = http.createServer(app);

//Sockets Cors
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'], // Use a specific origin
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Apply CORS middleware before other middleware
const corsOptions = {
  origin: ['http://localhost:5173'],
  methods: ['GET', 'POST'],
  credentials: true,
  optionsSuccessStatus: 200
}; 
 
app.use(cors(corsOptions));

app.use(express.json());
app.use('/api', routes);

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.get('/', (req, res) => {
  res.send('Project Running Smoothly!!');
});

setupSocket(io); // Set up socket events


const PORT = process.env.PORT || 5800;
server.listen(PORT, () => {
  dbConnection(); // Initialize database connection
  bootstrapAdmin()
  console.log(`Server is running on port ${PORT}`);
});


module.exports = { io };  // Export io for other files (to avoid circular dependency)