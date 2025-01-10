import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // React app origin
    methods: ['GET', 'POST'],
  },
});

let users = [];

io.on('connection', (socket) => {
  console.log(`User Connected>>>${socket.id}`);

  // Add user to the room
  socket.on('join_chat', (username) => {
    users.push({ id: socket.id, username });
    io.emit('update_users', users);
  });

  // Handle message broadcasting
  socket.on('send_message', (data) => {
    io.emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    users = users.filter((user) => users.id !== socket.id);
    io.emit('update_user', users);
    console.log(`User disconnected>>>${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
