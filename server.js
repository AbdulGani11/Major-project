const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static('./public'));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Map to keep track of rooms and their clients
const rooms = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle room joining
  socket.on('join room', ({ roomId, username }) => {
    socket.join(roomId);
    rooms[roomId] = rooms[roomId] || [];
    rooms[roomId].push({ id: socket.id, username });
    console.log(`User ${username} joined room: ${roomId}`);
  });

  // Handle room leaving
  socket.on('leave room', (roomId) => {
    socket.leave(roomId);
    const roomClients = rooms[roomId];
    if (roomClients) {
      const index = roomClients.findIndex(client => client.id === socket.id);
      if (index !== -1) {
        roomClients.splice(index, 1);
        console.log(`User left room: ${roomId}`);
      }
    }
  });

// Handle code updates
socket.on('code update', (data) => {
  console.log(`Emitting code update to all clients in room: ${data.roomId}`);
  // Emit to all clients in the room, including the sender
  socket.to(data.roomId).emit('code update', { ...data, username: data.username });
});


  // Handle cursor movements
  socket.on('cursor move', (data) => {
    console.log(`Received cursor move from ${data.username}:`, data);
    socket.to(data.roomId).emit('cursor move', { ...data, username: data.username });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Remove the user from all rooms they were in
    Object.keys(rooms).forEach((roomId) => {
      const index = rooms[roomId].findIndex(client => client.id === socket.id);
      if (index !== -1) {
        rooms[roomId].splice(index, 1);
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
