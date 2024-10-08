const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const routes = require('./routes/index');
const dbConnection = require('./config/connection');
require('dotenv').config();
const bootstrapAdmin = require('./utils/bootstrap')

const app = express();
const server = http.createServer(app);



// Apply CORS middleware before other middleware
const corsOptions = {
  origin: ["*"],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
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


const PORT = process.env.PORT || 5800;
server.listen(PORT, () => {
  dbConnection(); // Initialize database connection
  bootstrapAdmin()
  console.log(`Server is running on port ${PORT}`);
});

