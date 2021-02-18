const { tasks } = require('../constants');
const { error } = require('../util');

const startCommand = (game, player, parsed) => {
  if (game.host !== player.socket.id) {
    player.addToQueue(error('Only the host can start the game.'));
    return;
  }

  // Choose one random imposter
  const imp = game.players[Math.floor(Math.random() * game.players.length)];
  imp.imposter = true;
  imp.killCooldown = game.killCooldown;
  imp.addToQueue([
    { cls: true },
    {
      img: `imposter/${imp.color}`,
      message: `You are an Imposter.
Kill all crewmates without being discovered!`,
    },
  ]);
  imp.addToQueue(game.lookMessage(imp));

  const longTasks = tasks.filter((x) => x.select && x.type === 'long');
  const shortTasks = tasks.filter((x) => x.select && x.type === 'short');
  const commonTasks = tasks.filter((x) => x.select && x.type === 'common');

  const crew = game.players.filter((x) => !x.imposter);
  crew.forEach((x) => {
    x.imposter = false;
    x.tasks = [
      ...commonTasks.sort(() => 0.5 - Math.random()).slice(0, game.commonTasks),
      ...longTasks.sort(() => 0.5 - Math.random()).slice(0, game.longTasks),
      ...shortTasks.sort(() => 0.5 - Math.random()).slice(0, game.shortTasks),
    ];
    x.tasks.forEach((t) => {
      if (Array.isArray(t.place))
        t.place = t.place[Math.floor(Math.random() * t.place.length)];
    });

    x.addToQueue([
      { cls: true },
      {
        img: `profile/${x.color}`,
        message: `You are a Crewmate.
Finish your tasks before you die!`,
      },
    ]);
    x.addToQueue(game.lookMessage(x));
  });

  game.state = 'main';
};
module.exports = startCommand;
