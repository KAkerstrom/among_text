const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');
const { newUser, removeUser, getUser } = require('./users');
const { joinGame, getGame } = require('./game');
const { error } = require('./util');

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
    let result = user.setUsername(username);
    if (result.error) {
      socket.emit('init_fail', [result]);
      return;
    }
    result = joinGame(socket, roomCode);
    if (result.error) {
      socket.emit('init_fail', [result]);
      return;
    }

    user.state = 'lobby';
    socket.emit('init_success', [result]);
    socket.to(roomCode).emit('msg', [
      {
        //img: `profile/${user.color}`,
        message: `${user.name()} has joined the room as ${user.color}.`,
      },
    ]);
  });

  socket.on('disconnect', () => {
    let user = getUser(socket.id);
    if (!user) return;
    let game = getGame(user.room);
    if (!game) return;

    io.to(game.code).emit('msg', [
      { message: `${user.username} has disconnected.` },
    ]);
    game.leave(socket.id);
    removeUser(socket.id);
  });

  socket.on('command', (data) => {
    if (!user.room) return [error('User not in a game. Try reconnecting.')];
    const game = getGame(user.room);
    if (!game) return [error('User is not in a game. Try reconnecting.')];
    try {
      game.parse(socket, data.message);
    } catch (ex) {
      console.error(ex);
      socket.emit('msg', [error('Unknown error occurred.')]);
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
