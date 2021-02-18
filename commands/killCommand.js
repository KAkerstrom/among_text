const { error } = require('../util');

const killCommand = (game, player, parsed) => {
  if (!player.imposter) {
    player.addToQueue(error('Only the imposter can kill.'));
    return;
  }
  if (player.vented) {
    player.addToQueue(error('You cannot kill from inside a vent.'));
    return;
  }
  if (player.killCooldown > 0) {
    player.addToQueue(
      error(
        `You must still wait ${player.killCooldown} turn${
          player.killCooldown === 1 ? '' : 's'
        } before you can kill.`
      )
    );
    return;
  }
  const victim = game.players.find(
    (x) =>
      x.place === player.place &&
      !x.dead &&
      (x.username.toLowerCase() === parsed.value || x.color === parsed.value)
  );
  if (victim) {
    if (player.username === victim.username) {
      player.addToQueue(error(`...you okay?`));
      return;
    }
    let action = {
      type: 'kill',
      player,
      victim,
    };
    let message = game.addAction(action);
    if (message) player.addToQueue(message);
  } else {
    player.addToQueue(error(`${parsed.value} is not in the room.`));
    return;
  }
};
module.exports = killCommand;
