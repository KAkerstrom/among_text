const { error } = require('../util');
const { map } = require('../constants');

const ventCommand = (game, player, parsed) => {
  if (!player.imposter) player.addToQueue(error('Only the imposter can vent.'));
  else if (!map[player.place].vents)
    player.addToQueue(error('There is no vent here.'));
  else if (player.vented) {
    game.players
      .filter((x) => x.place === player.place && x.id !== player.id)
      .forEach((x) =>
        x.addToQueue({
          img: `imposter/${player.color}`,
          message: `${player.username} (${player.color}) jumps out of the vent!`,
        })
      );
    player.addToQueue({
      img: `imposter/${player.color}`,
      message: 'You jump out of the vent.',
    });
    player.vented = false;
  } else {
    let action = {
      type: 'vent',
      player,
    };
    let message = game.addAction(action);
    if (message) player.addToQueue(message);
  }
};
module.exports = ventCommand;
