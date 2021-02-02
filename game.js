const games = {};
const { v4: uuid } = require('uuid');
const parser = require('./parser');
const { getUser } = require('./users');
const { error } = require('./util');
const { colors, map } = require('./constants');

const getAvailableColors = (roomCode) => {
  if (!games[roomCode]) return [];
  const usedColors = games[roomCode].players.reduce((obj, player) => {
    return [...obj, getUser(player).color];
  }, []);
  return colors.filter((x) => usedColors.indexOf(x) < 0);
};

const joinGame = (socket, roomCode) => {
  if (!roomCode) return error('Room code is required');
  if (roomCode.length < 3)
    return error('Room codes cannot be less than 3 characters.');
  if (roomCode.length > 16)
    return error('Room codes cannot be longer than 16 characters.');
  const user = getUser(socket.id);
  if (!user) return error('User does not exist. Try reconnecting.');

  user.room = roomCode;
  let game = games[roomCode];
  if (game) {
    if (game.state != 'lobby') return error('Game has already started.');
    const availableColors = getAvailableColors(roomCode);
    if (availableColors.length === 0) return error('Room is full.');
    user.color = availableColors[0];
    user.place = 'cafeteria';
    game.players.push(socket.id);
    socket.join(game.uuid);
    return { message: `Joined room lobby ${roomCode} as ${user.color}` };
  } else {
    game = {
      uuid: uuid(),
      code: roomCode,
      host: socket.id,
      players: [socket.id],
      state: 'lobby',
      actions: [],
    };
    games[roomCode] = game;
    user.color = colors[0];
    user.place = 'cafeteria';
    socket.join(game.uuid);
    return { message: `Created new lobby ${roomCode} as ${user.color}` };
  }
};

const leaveGame = (socketId) => {
  const roomCode = getUser(socketId)?.room;
  if (!roomCode) return;
  const game = games[roomCode];
  if (!game) return;

  if (game.players.length > 1) {
    game.players = game.players.filter((x) => x != socketId);
    if (game.host === socketId) game.host = game.players[0];
  } else {
    delete games[game.code];
  }
};

const getGame = (code) => games[code] || null;

const addAction = (io, game, action) => {
  game.actions.push(action);
  if (game.actions.length === game.players.length) {
    takeTurn(game, io);
    return false;
  } else {
    return { message: 'Action locked in. Waiting on others.' };
  }
};

const takeTurn = (game, io) => {
  const initiative = ['go'];
  game.actions.sort((x, y) => initiative.indexOf(x) - initiative.indexOf(y));
  game.actions.forEach((x) => {
    let user = getUser(x.player);
    switch (x.type) {
      case 'go':
        x.socket.leave(game.uuid + user.place);
        user.place = x.to;
        x.socket.join(game.uuid + user.place);
        x.socket.emit('msg', [{ message: `You go to ${x.to}` }]);
        break;
    }
  });
  game.actions = [];
};

const parse = (io, socket, command) => {
  if (command.length === 0) return;
  const user = getUser(socket.id);
  if (!user) return error('User not found. Try reconnecting.');
  const game = games[user.room];
  if (!game) return error('Game not found. Try reconnecting.');

  let message, exits;
  switch (game.state) {
    case 'lobby':
      if (command[0] !== '/') {
        io.in(user.room).emit('msg', [{ message: command }]);
        return;
      }
      if (command === '/start') {
        if (game.host !== socket.id) {
          socket.emit('msg', [error('Only the host can start the game.')]);
          return;
        } else {
          game.state = 'main';
          io.in(game.code).emit('msg', [
            { cls: true },
            { message: 'Game started.\nYou are in the cafeteria.' },
          ]);
        }
      }
      break;
    case 'main':
      let parsed = null;
      try {
        parsed = parser.parse(command);
      } catch (ex) {
        console.error('PARSING ERROR:\n' + ex);
        socket.emit(
          'msg',
          error(
            'Parsing error...\nThe error has been logged, and should hopefully be fixed in the next update.'
          )
        );
        return;
      }

      if (!parsed || parsed.error) {
        socket.emit('msg', [error(parsed.message || 'Parser error.')]);
        return;
      }

      switch (parsed.type) {
        case 'help':
          socket.emit('msg', [
            {
              message:
                'Current commands include "help", "look" and "go <direction>".',
            },
          ]);
          return;

        case 'look':
          const playersHere = game.players
            .map((x) => getUser(x))
            .filter((x) => x.id != user.id && x.place === user.place)
            .map((x) => `${x.username} (${x.color})\n`);
          message = `You are currently in ${user.place}.\n`;
          if (playersHere.length > 0)
            message += `\nOther players here are:\n${playersHere.toString()}`;
          exits = map[user.place].exits;
          message += '\nExits are:\n';
          ['north', 'east', 'west', 'south'].forEach((x) => {
            let exit = exits[x[0]];
            if (exit) message += `${x} - ${exit}\n`;
          });
          socket.emit('msg', [{ message }]);
          return;

        case 'go_cardinal':
          exits = map[user.place].exits;
          if (exits[parsed.value]) {
            let action = {
              player: user.id,
              socket,
              type: 'go',
              to: exits[parsed.value],
            };
            let message = addAction(io, game, action);
            if (message) socket.emit('msg', [message]);
          } else {
            socket.emit('msg', [error(`${parsed.value} is not a valid exit.`)]);
          }
          return;

        case 'go_location':
          exits = map[user.place].exits;
          for (let dir of Object.keys(exits)) {
            let exit = exits[dir];
            if (map[exit].aliases.indexOf(parsed.value) >= 0) {
              let action = {
                player: user.id,
                socket,
                type: 'go',
                to: exit,
              };
              let message = addAction(io, game, action);
              if (message) socket.emit('msg', [message]);
              return;
            }
          }
          socket.emit('msg', [error(`${parsed.value} is not a valid exit.`)]);
          return;

        case 'say':
      }

      return;
    case 'meeting':
      return;
  }
};

module.exports = {
  joinGame,
  leaveGame,
  getGame,
  parse,
};
