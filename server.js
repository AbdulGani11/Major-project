// Import required modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Initialize Express app
const app = express();

// Serve static files from the 'public' directory
// The path './public' is relative to the current file (server.js)
app.use(express.static('./public'));

// Create HTTP server using the Express app
const server = http.createServer(app);

// Initialize Socket.IO with the HTTP server
const io = socketIo(server);

// Event handler for new connections
io.on('connection', (socket) => {
    // Log the connection
    console.log(`User connected: ${socket.id}`);

    // Event handler for 'code update' messages
    socket.on('code update', (data) => {
        // Log the received code update
        console.log(`Received code update from ${socket.id}:`, data);
        // Broadcast the code update to all other clients except the sender
        socket.broadcast.emit('code update', data);
    });

    // Event handler for disconnections
    socket.on('disconnect', () => {
        // Log the disconnection
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Start the server and listen on port  3000
server.listen(3000, () => {
    console.log('Server listening on port  3000');
});
