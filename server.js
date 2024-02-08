// Import required modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

// Initialize Express app
const app = express();

// Enable CORS to allow cross-origin requests
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static('./public'));

// Serve the Socket.IO client library
app.use('/socket.io', express.static(path.join(__dirname, 'node_modules/socket.io-client/dist')));

// Create HTTP server using the Express app
const server = http.createServer(app);

// Initialize Socket.IO with the HTTP server
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"], // Allowed methods
    credentials: true // Allow credentials
  }
});

// Event handler for new connections
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Event handler for 'code update' messages
    socket.on('code update', (data, ack) => {
        console.log(`Received code update from ${socket.id}:`, data);
        socket.broadcast.emit('code update', data);
        
        // Only call the acknowledgment if it is a function
        if (typeof ack === 'function') {
            ack({ status: 'success' });
        }
    });

    // Event handler for disconnections
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Start the server and listen on port   3000
const PORT = process.env.PORT ||   3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
