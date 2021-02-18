const { error } = require('../util');
const { map } = require('../constants');

const goCardinalCommand = (game, player, parsed) => {
  let place = map[player.place].exits[parsed.value];
  if (place) {
    if (player.vented) {
      if (map[player.place].vents.indexOf(place) >= 0) {
        player.place = parsed.value;
        player.addToQueue({
          message: `You quietly vent to ${player.place}.`,
        });
        player.addToQueue(game.lookMessage(player));
      } else {
        player.addToQueue(error(`You cannot vent to ${place} from here.`));
      }
    } else {
      let action = {
        type: 'go',
        player,
        to: place,
      };
      let message = game.addAction(action);
      if (message) player.addToQueue(message);
    }
  } else {
    player.addToQueue(error(`${parsed.value} is not a valid exit.`));
  }
};
module.exports = goCardinalCommand;
