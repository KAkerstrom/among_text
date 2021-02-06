const games = {};
const { v4: uuidv4 } = require('uuid');
const parser = require('./parser');
const { getUser } = require('./users');
const { error } = require('./util');
const { colors, map } = require('./constants');

const getAvailableColors = (roomCode) => {
  if (!games[roomCode]) return [];
  const usedColors = games[roomCode].players.reduce((obj, player) => {
    return [...obj, player.color];
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
    game.players.push(user);
    socket.join(game.uuid + user.place);
    return {
      img: `profile/${user.color}.png`,
      message: `Joined room lobby ${roomCode} as ${user.color}.
Text entered here will be sent as a chat message to the room.`,
    };
  } else {
    game = {
      uuid: uuidv4(),
      code: roomCode,
      host: socket.id,
      players: [user],
      state: 'lobby',
      actions: [],
      bodies: [],
    };
    games[roomCode] = game;
    user.color = colors[0];
    user.place = 'cafeteria';
    socket.join(game.uuid + user.place);
    return {
      img: `profile/${user.color}.png`,
      message: `Created new lobby ${roomCode} as ${user.color}.
Text entered here will be sent as a chat message to the room.

Type /start to start the game.`,
    };
  }
};

const leaveGame = (socketId) => {
  const roomCode = getUser(socketId)?.room;
  if (!roomCode) return;
  const game = games[roomCode];
  if (!game) return;

  game.players.filter((x) => x); // Todo: Shouldn't need to do this, gonna have to look into it
  if (game.players.length > 1) {
    game.players = game.players.filter((x) => x.id != socketId);
    if (game.host === socketId) game.host = game.players[0].id;
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

const lookMessage = (game, player) => {
  const playersHere = game.players
    .filter(
      (x) =>
        x.id != player.id &&
        x.place === player.place &&
        !x.vented &&
        (!x.dead || player.dead)
    )
    .map((x) => `${x.username} (${x.color})\n`);
  let message;
  message = player.vented
    ? `You are hiding inside the vent in ${player.place}.\n`
    : `You are in ${player.place}.\n`;

  const bodies = game.bodies.filter((x) => x.place === player.place);
  if (bodies.length === 1) {
    message += `\nOh no!\nYou notice a dead body in the room!\nIt's ${bodies[0].username} (${bodies[0].color})!`;
  } else if (bodies.length > 1) {
    message += `\nOh no!!!\nYou notice dead bodies in the room!\nThe bodies are:\n`;
    bodies.forEach((x) => (message += `   ${x.username} (${x.color})\n`));
  }

  if (playersHere.length > 0)
    message += `\nOther players here are:\n${playersHere.toString()}`;
  const exits = map[player.place].exits;
  message += '\nExits:\n';
  ['north', 'east', 'west', 'south'].forEach((x) => {
    let exit = exits[x[0]];
    if (exit) message += `${x} - ${exit}\n`;
  });
  return { img: `rooms/${player.place}.png`, imgSize: 128, message };
};

const takeTurn = (game, io) => {
  const initiative = ['wait', 'go', 'vent'];
  let message = null;
  game.actions.sort(
    (x, y) => initiative.indexOf(x.type) - initiative.indexOf(y.type)
  );
  game.players.forEach((x) => x.addToQueue({ cls: true }));
  game.actions.forEach((x) => {
    const { player } = x;
    switch (x.type) {
      case 'wait':
        x.socket.emit('msg', [
          { message: "You've waited patiently for a while." },
          lookMessage(game, player),
        ]);
        break;

      case 'go':
        // Announce leaving the room
        message = {
          img: `profile/${player.color}.png`,
          message: `${player.username} (${player.color}) has gone to ${x.to}.`,
        };
        game.players
          .filter((y) => player.place === y.place && player.id !== y.id)
          .forEach((y) => y.addToQueue(message));

        x.socket.leave(game.uuid + player.place);
        player.place = x.to;
        x.socket.join(game.uuid + player.place);

        message = {
          img: `profile/${player.color}.png`,
          message: `${player.username} (${player.color}) has entered the room.`,
        };
        game.players
          .filter((y) => player.place === y.place && player.id !== y.id)
          .forEach((y) => y.addToQueue(message));

        player.addToQueue({ message: `You go to ${x.to}` });
        player.addToQueue(lookMessage(game, player));
        break;

      case 'vent':
        message = {
          img: `imposter/${player.color}.png`,
          message: `${player.username} (${player.color}) has just jumped into a vent!`,
        };
        game.players
          .filter((y) => player.place === y.place && player.id !== y.id)
          .forEach((y) => y.addToQueue(message));

        player.vented = true;
        player.addToQueue({
          img: `imposter/${player.color}.png`,
          message: `You jump into the vent.`,
        });
        player.addToQueue(lookMessage(game, player));
        break;

      case 'kill':
        x.victim.dead = true;
        game.bodies.push({
          username: x.victim.username,
          color: x.victim.color,
          place: player.place,
        });

        // Imposter message
        message = {
          img: `imposter/${player.color}.png`,
          message: `You kill ${x.victim.username} in cold blood!`, // Todo: Random kill messages
        };
        player.addToQueue(message);

        // Victim message
        message = {
          img: `imposter/${player.color}.png`,
          imgSize: 80,
          message: `${player.username} has murdered you in cold blood!`,
        };
        x.victim.addToQueue(message);

        // Witness message
        message = {
          img: `imposter/${player.color}.png`,
          message: `${player.username} has murdered ${x.victim.username} right in front of you!`,
        };
        game.players
          .filter(
            (y) =>
              y.place === player.place &&
              y.id !== player.id &&
              y.id !== x.victim.id
          )
          .forEach((y) => y.addToQueue(message));

        // Cancel victim's actions
        break;
    }
  });
  game.actions = [];
  game.players.forEach((x) => x.flushQueue());
};

const parse = (io, socket, command) => {
  if (command.length === 0) return;
  const user = getUser(socket.id);
  if (!user) return error('User not found. Try reconnecting.');
  const game = games[user.room];
  if (!game) return error('Game not found. Try reconnecting.');
  command = command.toLowerCase();

  let exits;
  switch (game.state) {
    case 'lobby':
      {
        if (command[0] !== '/') {
          io.in(user.room).emit('msg', [{ message: command }]);
          return;
        }
        if (command === '/start') {
          if (game.host !== socket.id) {
            socket.emit('msg', [error('Only the host can start the game.')]);
            return;
          } else {
            // Choose one random imposter
            game.players.forEach((x) => (x.imposter = false));
            game.players[
              Math.floor(Math.random() * game.players.length)
            ].imposter = true;

            //Todo:  Tell each player whether they are an imposter
            const crewStartMsg = {
              message: `You are a Crewmate.
              Finish your tasks before you die!`,
            };
            const impStartMsg = {
              message: `You are an Imposter.
            Kill all crewmates without being found out!`,
            };
            game.players.forEach((x) => {
              x.addToQueue({ cls: true });
              x.addToQueue(
                x.imposter
                  ? { ...impStartMsg, img: `imposter/${x.color}.png` }
                  : { ...crewStartMsg, img: `profile/${x.color}.png` }
              );
              x.addToQueue(lookMessage(game, x));
              x.flushQueue();
            });

            game.state = 'main';
          }
        }
      }
      break;

    case 'main':
      let parsed = null;
      try {
        parsed = parser.parse(command);
      } catch (ex) {
        console.error(`PARSING ERROR:\n${command}\n${ex}`);
        socket.emit('msg', [error('Parsing error...')]);
        return;
      }

      if (!parsed || parsed.error) {
        socket.emit('msg', [error(parsed.message || 'Parser error.')]);
        return;
      }

      let message;
      switch (parsed.type) {
        case 'help':
          socket.emit('msg', [
            {
              message: `Current commands include:
help
look
wait
go <direction>
say <something>`,
            },
          ]);
          return;

        case 'wait':
          let action = {
            player: user,
            socket,
            type: 'wait',
          };
          message = addAction(io, game, action);
          if (message) socket.emit('msg', [message]);
          return;

        case 'look':
          socket.emit('msg', [lookMessage(game, user)]);
          return;

        case 'go_cardinal':
          let place = map[user.place].exits[parsed.value];
          if (place) {
            if (user.vented) {
              if (map[user.place].vents.indexOf(place) >= 0) {
                user.socket.leave(game.uuid + user.place);
                user.place = parsed.value;
                user.socket.join(game.uuid + user.place);
                socket.emit('msg', [
                  { message: `You quietly vent to ${user.place}.` },
                  lookMessage(game, user),
                ]);
              } else {
                socket.emit('msg', [
                  error(`You cannot vent to ${place} from here.`),
                ]);
              }
            } else {
              let action = {
                player: user,
                socket,
                type: 'go',
                to: place,
              };
              message = addAction(io, game, action);
              if (message) socket.emit('msg', [message]);
            }
          } else {
            socket.emit('msg', [error(`${parsed.value} is not a valid exit.`)]);
          }
          return;

        case 'go_location':
          if (user.vented) {
            if (map[user.place].vents.indexOf(parsed.value) >= 0) {
              user.socket.leave(game.uuid + user.place);
              user.place = parsed.value;
              user.socket.join(game.uuid + user.place);
              socket.emit('msg', [
                { message: `You quietly vent to ${user.place}.` },
                lookMessage(game, user),
              ]);
            } else
              socket.emit('msg', [
                error(`You can't vent to ${parsed.value} from here.`),
              ]); //Todo: show possible vent locations
            return;
          } else {
            exits = map[user.place].exits;
            for (let dir of Object.keys(exits)) {
              let exit = exits[dir];
              if (map[exit].aliases.indexOf(parsed.value) >= 0) {
                let action = {
                  player: user,
                  socket,
                  type: 'go',
                  to: exit,
                };
                message = addAction(io, game, action);
                if (message) socket.emit('msg', [message]);
                return;
              }
            }
          }
          socket.emit('msg', [error(`${parsed.value} is not a valid exit.`)]);
          return;

        case 'vent':
          if (!user.imposter)
            socket.emit('msg', error('Only the imposter can vent.'));
          else if (!map[user.place].vents)
            socket.emit('msg', error('There is no vent here.'));
          else if (user.vented) {
            socket.to(game.uuid + user.place).emit('msg', [
              {
                img: `imposter/${user.color}.png`,
                message: `${user.username} (${user.color}) jumps out of the vent!`,
              },
            ]);
            socket.emit('msg', [
              {
                img: `imposter/${player.color}.png`,
                message: 'You jump out of the vent.',
              },
            ]);
            user.vented = false;
          } else {
            let action = {
              player: user,
              socket,
              type: 'vent',
            };
            message = addAction(io, game, action);
            if (message) socket.emit('msg', [message]);
          }
          return;

        case 'say':
          message = {
            type: 'chat',
            username: user.username,
            img: `profile/${user.color}.png`,
            message: parsed.value,
          };
          game.players
            .filter((x) => x.place === user.place && (x.dead || !user.dead))
            .forEach((x) => x.socket.emit('msg', [message]));
          return;

        case 'kill':
          if (!user.imposter) {
            socket.emit('msg', [error('Only the imposter can kill.')]);
            return;
          }
          if (user.vented) {
            socket.emit('msg', [error('You cannot kill from inside a vent.')]);
            return;
          }
          const victim = game.players.find(
            (x) =>
              x.place === user.place &&
              !x.dead &&
              (x.username.toLowerCase() === parsed.value ||
                x.color === parsed.value)
          );
          if (victim) {
            let action = {
              player: user,
              socket,
              type: 'kill',
              victim,
            };
            message = addAction(io, game, action);
            if (message) socket.emit('msg', [message]);
          } else {
            socket.emit('msg', [error(`${parsed.value} is not in the room.`)]);
            return;
          }
          return;

        case 'report':
          return;
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
