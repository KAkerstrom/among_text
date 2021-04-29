const games = {};
const { v4: uuidv4 } = require('uuid');
const mainParser = require('./parser');
const { getUser } = require('./users');
const { error } = require('./util');
const { colors, map } = require('./constants');
const commands = require('./commands');

class Game {
  constructor(host, roomCode) {
    this.uuid = uuidv4();
    this.code = roomCode;
    this.host = host.id;
    this.players = [host];
    this.resetForLobby();

    this.killCooldown = 4;
    this.longTasks = 1;
    this.shortTasks = 3;
    this.commonTasks = 1;

    host.color = colors[Math.floor(Math.random() * colors.length)];
    host.place = 'lobby';
  }

  resetForLobby() {
    this.players.forEach((x) => x.reset());
    this.actions = [];
    this.bodies = [];
    this.votes = [];
    this.state = 'lobby';
    this.activeSabotage = null;
    this.sabotageCooldown = 0;
  }

  getAvailableColors() {
    const usedColors = this.players.reduce((obj, player) => {
      return [...obj, player.color];
    }, []);
    return colors.filter((x) => usedColors.indexOf(x) < 0);
  }

  join(player) {
    if (this.state != 'lobby') return error('Game has already started.');
    else if (this.players.find((x) => x.username === player.username))
      return error('A user in the room already has that name.');
    const availableColors = this.getAvailableColors();
    if (availableColors.length === 0) return error('Room is full.');

    player.color =
      availableColors[Math.floor(Math.random() * availableColors.length)];
    player.place = 'cafeteria';
    player.addToQueue();

    this.players.forEach((x) => {
      x.addToQueue({ message: `${player.name()} has joined the lobby!` });
      x.flushQueue();
    });
    this.players.push(player);

    return {
      cls: true,
      message: `Joined room lobby "${this.code}" as ${player.name()}.

Commands:
  say <something> ....... Say something to the lobby

Players:\n${this.players
        .filter((x) => x.id !== player.id)
        .map((x) => '  ' + x.name())}`,
    };
  }

  leave(player) {
    if (this.players.length > 1) {
      this.players = this.players.filter((x) => x != player);
      if (this.host === player.id) this.host = this.players[0].id;
      if (this.state != 'lobby') this.checkEndGame();
    } else {
      delete games[this.code];
    }
  }

  addAction(action) {
    this.actions.push(action);
    if (this.actions.length === this.players.length) {
      this.takeTurn();
      return false;
    } else {
      return { message: 'Action locked in. Waiting on others.' };
    }
  }

  takeTurn() {
    this.players.forEach((x) => {
      if (x.killCooldown > 0) x.killCooldown -= 1;
      if (x.samplesCooldown > 0) x.samplesCooldown -= 1;
    });

    const killedPlayers = []; // an array, in case I add >1 imposter later on
    const initiative = ['wait', 'go', 'vent'];
    let message = null;
    this.actions.sort(
      (x, y) => initiative.indexOf(x.type) - initiative.indexOf(y.type)
    );
    this.players.forEach((x) => x.addToQueue({ cls: true }));
    this.actions.forEach((action) => {
      const { player } = action;
      if (killedPlayers.indexOf(player.id) >= 0)
        player.addToQueue(error('Being killed has interrupted your action.'));
      else
        switch (action.type) {
          case 'wait':
            player.addToQueue({
              message: "You've waited patiently for a while.",
            });
            break;

          case 'go':
            // Announce leaving the room
            message = {
              message: `${player.name()} has gone to ${action.to}.`,
            };
            this.players
              .filter((x) => player.place === x.place && player.id !== x.id)
              .forEach((x) => x.addToQueue(message));
            player.place = action.to;
            message = {
              message: `${player.name()} has entered the room.`,
            };
            this.players
              .filter((x) => player.place === x.place && player.id !== x.id)
              .forEach((x) => x.addToQueue(message));

            player.addToQueue({ message: `You go to ${action.to}` });
            break;

          case 'vent':
            message = {
              message: `${player.name(
                'imposter'
              )} has just jumped into a vent!`,
            };
            this.players
              .filter((x) => player.place === x.place && player.id !== x.id)
              .forEach((x) => x.addToQueue(message));

            player.vented = true;
            player.addToQueue({
              img: `imposter/${player.color}`,
              message: `You jump into the vent.`,
            });
            break;

          case 'kill':
            player.killCooldown = this.killCooldown;
            action.victim.dead = true;
            this.bodies.push({
              username: action.victim.username,
              color: action.victim.color,
              place: player.place,
            });

            // Imposter message
            message = {
              message: `You kill ${action.victim.name('dead')} in cold blood!
You cannot kill again for ${this.killCooldown} turns.`,
            };
            player.addToQueue(message);

            // Victim message
            message = {
              imgSize: 80,
              message: `${player.name(
                'imposter'
              )} has murdered you in cold blood!`,
            };
            action.victim.addToQueue(message);

            // Witness message
            message = {
              message: `${player.name(
                'imposter'
              )} has murdered ${action.victim.name(
                'dead'
              )} right in front of you!`,
            };
            this.players
              .filter(
                (x) =>
                  x.place === player.place &&
                  x.id !== player.id &&
                  x.id !== action.victim.id
              )
              .forEach((x) => x.addToQueue(message));

            killedPlayers.push(action.victim.id);
            if (this.checkEndGame()) return;
            break;
        }
    });
    this.actions = [];
    this.players.forEach((x) => {
      x.addToQueue(this.lookMessage(x));
    });
  }

  lookMessage(player) {
    const playersHere = this.players
      .filter(
        (x) =>
          x.id != player.id &&
          x.place === player.place &&
          !x.vented &&
          (!x.dead || player.dead)
      )
      .map((x) => `${x.name()}\n`);
    let message;
    message = player.vented
      ? `You are hiding inside the vent in ${player.place}.\n`
      : `You are in ${player.place}.\n`;

    if (playersHere.length > 0)
      message += `\nOther players here are:\n${playersHere.join('')}`;
    const exits = map[player.place].exits;
    if (player.vented) {
      message += `\nRooms you can vent to:
${map[player.place].vents.join('\n')}`;
    } else {
      message += '\nExits:\n';
      ['north', 'east', 'west', 'south'].forEach((x) => {
        let exit = exits[x[0]];
        if (exit) message += `  ${x} - ${exit}\n`;
      });
    }
    // Should replace this with a more flexible room description
    if (player.place === 'cafeteria')
      message +=
        '\nThe Emergency Button is here. You can [[b;green;]press] the button to call a meeting.';

    if (!player.imposter && player.tasks) {
      const tasks_here = player.tasks.filter((x) => x.place === player.place);
      if (tasks_here.length > 0) {
        message += '\n\nYou have tasks in this room:';
        tasks_here.forEach((x) => {
          message += `\n${x.description}`;
        });
      }
    }

    let output = [{ message }];

    const bodies = this.bodies.filter((x) => x.place === player.place);
    bodies.forEach((x) => {
      console.log(x.id);
      if (player.id === x.id)
        output.push({
          img: `dead/${x.color}`,
          message: `Your dead body is here on the ground...`,
        });
      else
        output.push({
          img: `dead/${x.color}`,
          message: `Oh no! A dead body!\nIt's ${x.name('dead')}!`,
        });
    });
    if (player.imposter && player.killCooldown > 0) {
      player.addToQueue({
        img: `imposter/${player.color}`,
        imgSize: 32,
        message: `You must wait ${player.killCooldown} turn${
          player.killCooldown === 1 ? '' : 's'
        } before you can kill.`,
      });
    }

    return output;
  }

  parse(socket, command) {
    if (command.length === 0) return;
    const player = this.players.find((x) => x.socket.id === socket.id);
    if (!player) return error('User not found. Try reconnecting.');
    command = command.replace('\n', '');
    // try {
    let parsed = mainParser.parse(command.toLowerCase(), {
      usernames: this.players.map((x) => x.username.toLowerCase()),
      usercolors: this.players.map((x) => x.color.toLowerCase()),
      colors,
    });

    console.log('parsed: ', parsed);
    if (parsed.error) {
      player.addToQueue(error(parsed.message));
    } else if (Object.keys(commands).indexOf(this.state) === -1) {
      player.addToQueue(error("You can't do that here."));
    } else commands[this.state][parsed.type](this, player, parsed, command);
    // } catch (ex) {
    //   console.error(`PARSING ERROR:\n${command}\n${ex}`);
    //   player.addToQueue(error('Parsing error...'));
    // }

    this.players.forEach((x) => x.flushQueue());
  }

  callMeeting(player, bodyReported) {
    this.state = 'meeting';
    this.actions = [];
    let message = bodyReported
      ? '!!! BODY REPORTED !!!'
      : '--- EMERGENCY MEETING ---';
    message += '\nAny locked-in actions have been cancelled.\n\n';
    this.players.forEach(
      (x) =>
        (message += `${x.name(x.dead ? 'dead' : 'profile')}${
          x.dead ? ' - DEAD' : ''
        }${x.id === player.id ? ' - MEETING HOST' : ''}\n`)
    );
    this.players.forEach((x) => {
      x.vented = false;
      x.place = 'cafeteria';
      x.addToQueue([{ cls: true }, { img: 'rooms/cafeteria', message }]);
    });
  }

  endMeeting() {
    const voteCount = {};
    this.votes.forEach((x) => {
      const id = x.vote === 'skip' ? 'skip' : x.vote.id;
      voteCount[id] ? (voteCount[id] += 1) : (voteCount[id] = 1);
    });
    this.votes = [];

    let tie = false;
    let winningVote = { id: null, count: 0 };
    Object.keys(voteCount).forEach((x) => {
      if (voteCount[x] >= winningVote.count) {
        tie = voteCount[x] === winningVote.count;
        winningVote = { id: x, count: voteCount[x] };
      }
    });

    this.players.forEach((x) =>
      x.addToQueue([{ cls: true }, { message: 'The votes are...\n' }])
    );

    this.players.forEach((x) => {
      const votesForPlayer = voteCount[x.id];
      if (votesForPlayer) {
        let msg = {
          message: `${x.name()}: ${votesForPlayer} votes\n`,
        };
        this.players.forEach((y) => y.addToQueue(msg));
      }
    });
    if (voteCount['skip']) {
      let msg = {
        message: `Skipped: ${voteCount['skip']} votes\n`,
      };
      this.players.forEach((x) => x.addToQueue(msg));
    }
    if (tie || winningVote.id === 'skip') {
      this.players.forEach((x) =>
        x.addToQueue({ message: 'No one was ejected. (Skipped/Tie)' })
      );
    } else {
      const votedPlayer = this.players.find((y) => y.id === winningVote.id);
      votedPlayer.dead = true;
      this.players.forEach((x) => {
        x.addToQueue({
          message: `${votedPlayer.name()} has been voted out... the airlock.`,
        });
      });
    }

    this.checkEndGame();
  }

  checkEndGame() {
    // Check if all imposters are dead
    if (!this.players.find((x) => x.imposter && !x.dead)) {
      this.endGame(true);
      return true;
    } else if (
      // Check if imposters outnumber or equal crewmates
      this.players.filter((x) => !x.dead && x.imposter).length >=
      this.players.filter((x) => !x.dead && !x.imposter).length
    ) {
      this.endGame(false);
      return true;
    }
    return false;
  }

  endGame(crewWon) {
    const imposter = this.players.find((x) => x.imposter);
    let crewMsg, imposterMsg;
    if (crewWon) {
      crewMsg = {
        img: `dead/${imposter.color}`,
        imgSize: 64,
        message: `VICTORY!\n\n${imposter.name('imposter')} was the imposter.`,
      };
      imposterMsg = {
        img: `dead/${imposter.color}`,
        imgSize: 64,
        message: `DEFEAT.`,
      };
    } else {
      crewMsg = {
        img: `imposter/${imposter.color}`,
        imgSize: 64,
        message: `DEFEAT.\n\n${imposter.name('imposter')} was the imposter.`,
      };
      imposterMsg = {
        img: `imposter/${imposter.color}`,
        imgSize: 64,
        message: `VICTORY!`,
      };
    }

    this.players
      .filter((x) => !x.imposter)
      .forEach((x) => x.addToQueue(crewMsg));
    imposter.addToQueue(imposterMsg);
    this.players.forEach((x) =>
      x.addToQueue({ message: '\nYou are in the game lobby.' })
    );
    this.resetForLobby();
  }
}

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
    return game.join(user);
  } else {
    game = new Game(user, roomCode);
    games[roomCode] = game;
    return {
      //img: `profile/${user.color}`,
      cls: true,
      message: `Created new lobby "${roomCode}" as ${user.name()}.
      
Commands:
  say <something> ....... Say something to the lobby
  start game ............ Start the game!`,
    };
  }
};

const getGame = (code) => games[code] || null;

module.exports = {
  joinGame,
  getGame,
};
