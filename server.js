const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static('./public'));

const ot = require('ot');
const TextOperation = ot.TextOperation;

app.use('/socket.io', express.static(path.join(__dirname, 'node_modules/socket.io-client/dist')));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  const userId = socket.handshake.auth?.userId;
  if (userId) {
    console.log(`Authenticated user: ${userId}`);
  } else {
    console.log('Unauthenticated user');
    socket.disconnect();
    return;
  }

  socket.on('code update', (data, ack) => {
    console.log(`Emitting code update to all clients`);
    socket.broadcast.emit('code update', data);
    setTimeout(() => {
      if (ack) {
        console.log(`Sending acknowledgment for code update`);
        ack({ status: 'success' });
      }
    },  100);
  });

  socket.on('cursor move', (data, ack) => {
    console.log(`Received cursor move from ${userId}:`, data);
    socket.broadcast.emit('cursor move', { ...data, userId: userId });
    setTimeout(() => {
      if (ack) {
        console.log(`Sending acknowledgment for cursor move`);
        ack({ status: 'success' });
      }
    },  100);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${userId}`);
  });
});

const PORT = process.env.PORT ||  3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});