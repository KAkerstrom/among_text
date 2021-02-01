const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');
const { newUser, removeUser, getUser, setUsername } = require('./users');
const { joinGame, leaveGame, getGame, parse } = require('./game');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(
  cors({
    origin: '*',
    optionsSuccessStatus: 200,
  })
);

app.use('/', express.static(path.join(__dirname, 'client/public')));
app.use(
  '/room/[a-zA-Z0-9]{3,16}',
  express.static(path.join(__dirname, 'client/public'))
);

io.on('connect', (socket) => {
  const user = newUser(socket);

  socket.on('init', ({ username, roomCode }) => {
    let result = setUsername(socket.id, username);
    if (result.error) {
      socket.emit('init_fail', [result]);
      return;
    }
    if (roomCode) {
      result = joinGame(socket.id, roomCode);
      if (result.error) {
        socket.emit('init_fail', [result]);
        return;
      }
    }

    const user = getUser(socket.id);
    user.state = 'lobby';
    socket.join(roomCode);
    socket.emit('init_success', [result]);
    socket
      .to(roomCode)
      .emit('msg', [
        { message: `${username} has joined the room as ${user.color}` },
      ]);
  });

  socket.on('disconnect', () => {
    let user = getUser(socket.id);
    if (!user) return;
    let room = getGame(user.room);
    if (!room) return;

    io.to(room.code).emit('msg', [
      { message: `${user.username} has disconnected.` },
    ]);
    leaveGame(socket.id);
    removeUser(socket.id);
  });

  socket.on('command', (data) => {
    const user = getUser(socket.id);
    if (!user) return [error('No user found. Try reconnecting.')];
    if (!user.room) return [error('User not in a game. Try reconnecting.')];
    const game = getGame(user.room);
    if (!game) return [error('User is not in a game. Try reconnecting.')];

    parse(io, socket, data.message);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
