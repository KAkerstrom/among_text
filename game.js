const games = {};
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

const joinGame = (socketId, roomCode) => {
  if (!roomCode) return error('Room code is required');
  if (roomCode.length < 3)
    return error('Room codes cannot be less than 3 characters.');
  if (roomCode.length > 16)
    return error('Room codes cannot be longer than 16 characters.');
  const user = getUser(socketId);
  if (!user) return error('User does not exist. Try reconnecting.');

  user.room = roomCode;
  const game = games[roomCode];
  if (game) {
    if (game.state != 'lobby') return error('Game has already started.');
    const availableColors = getAvailableColors(roomCode);
    if (availableColors.length === 0) return error('Room is full.');
    user.color = availableColors[0];
    user.place = 'cafeteria';
    game.players.push(socketId);
    return { message: `Joined room lobby ${roomCode} as ${user.color}` };
  } else {
    games[roomCode] = {
      code: roomCode,
      host: socketId,
      players: [socketId],
      state: 'lobby',
      actions: [],
    };
    user.color = colors[0];
    user.place = 'cafeteria';
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

const takeTurn = (game, io) => {
  const initiative = ['go'];
  game.actions.sort((x, y) => initiative.indexOf(x) - initiative.indexOf(y));
  game.actions.forEach((x) => {
    switch (x.type) {
      case 'go':
        getUser(x.player).place = x.to;
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

  let index, message, exits;
  switch (game.state) {
    case 'lobby':
      if (command[0] !== '/') {
        console.log(command);
        io.in(user.room).emit('msg', [{ message: command }]);
        return;
      }
      if (command === '/start') {
        if (game.host !== socket.id) {
          console.log([error('Only the host can start the game.')]);
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
      const split = command.split(' ');
      switch (split[0]) {
        case 'help':
          socket.emit('msg', [
            { message: 'Current commands include "look" and "go".' },
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

        case 'go':
          exits = map[user.place].exits;
          const exitChars = Object.keys(exits);
          if (split.length < 2) {
            socket.emit('msg', [{ message: 'Go where?' }]);
            return;
          }
          // Try to get the desired direction as a single character
          // Possibly better to store every possible exit direction alias per room?
          let dir = split[1];
          if (exitChars.indexOf(dir) < 0) {
            if (['north', 'east', 'west', 'south'].indexOf(dir) >= 0)
              dir = dir[0];
            else {
              for (let x of exitChars) {
                if (map[exits[x]].aliases.indexOf(dir) >= 0) {
                  dir = x;
                  break;
                }
              }
            }
          }

          // dir should now either be a valid directional character, or something invalid
          if (exitChars.indexOf(dir) >= 0) {
            game.actions.push({
              player: user.id,
              socket,
              type: 'go',
              to: exits[dir],
            });
            if (game.actions.length === game.players.length) {
              takeTurn(game, io);
            } else {
              socket.emit('msg', [
                { message: 'Action locked in. Waiting on others.' },
              ]);
            }
          } else {
            socket.emit('msg', [
              { message: `${split[1]} is not a valid exit.` },
            ]);
          }
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
