const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// simple HTTP status endpoint for probes
app.get('/status', (req, res) => {
  res.json({ ok: true, time: Date.now() });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

// roomId -> Set(socketId)
const rooms = new Map();
// socketId -> state { cameraOn:boolean, name?:string }
const participantState = new Map();

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on('join-room', ({ roomId, userId, name }) => {
    socket.join(roomId);
    socket.roomId = roomId;
    socket.userId = userId;
    socket.name = name;

    if (!rooms.has(roomId)) rooms.set(roomId, new Set());
    rooms.get(roomId).add(socket.id);
    participantState.set(socket.id, { cameraOn: false, name });

    // notify existing participants
    socket.to(roomId).emit('user-joined', { id: socket.id, userId, name });

    // emit current participants to all in room
    const list = Array.from(rooms.get(roomId)).map((id) => ({ socketId: id, ...(participantState.get(id) || {}) }));
    io.in(roomId).emit('participants', list);
  });

  socket.on('state-update', (data) => {
    const st = participantState.get(socket.id) || {};
    const merged = { ...st, ...data };
    participantState.set(socket.id, merged);
    const roomId = socket.roomId;
    if (roomId) {
      // emit just this participant update
      socket.to(roomId).emit('state-update', { socketId: socket.id, ...merged });
    }
  });

  socket.on('signal', ({ to, data }) => {
    if (!to) return;
    io.to(to).emit('signal', { fromSocketId: socket.id, data });
  });

  socket.on('chat', (m) => {
    if (m && m.roomId) io.in(m.roomId).emit('chat', m);
  });

  socket.on('leave-room', () => {
    const roomId = socket.roomId;
    if (!roomId) return;
    socket.leave(roomId);
    if (rooms.has(roomId)) {
      rooms.get(roomId).delete(socket.id);
  participantState.delete(socket.id);
  io.in(roomId).emit('user-left', { id: socket.id });
  const list = Array.from(rooms.get(roomId)).map((id) => ({ socketId: id, ...(participantState.get(id) || {}) }));
      io.in(roomId).emit('participants', list);
    }
  });

  socket.on('disconnect', () => {
    const roomId = socket.roomId;
    if (roomId && rooms.has(roomId)) {
      rooms.get(roomId).delete(socket.id);
  participantState.delete(socket.id);
  io.in(roomId).emit('user-left', { id: socket.id });
  const list = Array.from(rooms.get(roomId)).map((id) => ({ socketId: id, ...(participantState.get(id) || {}) }));
      io.in(roomId).emit('participants', list);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log('Signaling server listening on', PORT));
