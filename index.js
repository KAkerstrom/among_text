const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');
const game = require('./game');
const {
  newUser,
  getUser,
  joinRoom,
  leaveRoom,
  getRoom,
  setUsername,
} = require('./users');

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
  const user = newUser(socket.id);

  socket.on('init', ({ username, roomCode }) => {
    const errors = [];
    if (username) {
      result = setUsername(socket.id, username);
      if (result.error) errors.push(result);
    } else errors.push({ error: true, message: 'Username is required.' });
    if (roomCode) {
      result = joinRoom(socket.id, roomCode);
      if (result.error) errors.push(result);
    } else errors.push({ error: true, message: 'Room Code is required.' });

    if (errors.length > 0) socket.emit('init_fail', errors);
    else {
      getUser(socket.id).state = 'lobby';
      socket.join(roomCode);
      socket.emit('init_success', [{ message: 'Welcome, ' + username }]);
      socket
        .to(roomCode)
        .emit('msg', [{ message: `${username} has joined the room!` }]);
    }
  });

  socket.on('disconnect', () => {
    let user = getUser(socket.id);
    if (!user) return;
    let room = getRoom(user.room);
    if (!room) return;

    socket.leave(socket.room);
    leaveRoom(socket.id);
    io.to(room.id).emit('msg', [
      { message: `${user.username} has disconnected.` },
    ]);
  });

  socket.on('command', (data) => {
    let result;
    switch (user.state) {
      case 'await_init':
        socket.emit('msg', [
          {
            error: true,
            message: 'An error has occurred. Try refreshing and trying again.',
          },
        ]);
        break;

      case 'lobby':
        if (data.message.startsWith('/'))
          socket.emit('msg', [{ message: 'okay' }]);
        else
          io.in(user.room).emit('msg', [
            {
              speaker: user.username,
              message: `${user.username} says: ${data.message}`,
            },
          ]);
        break;

      default:
        socket.emit('msg', [{ message: '[unknown state]' }]);
        break;
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
