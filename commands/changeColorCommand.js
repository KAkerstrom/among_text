const { error } = require('console');
const { colors } = require('../constants');

const changeColorCommand = (game, player, parsed) => {
  const availableColors = colors.filter(
    (x) => !game.players.find((y) => y.color === x)
  );
  if (availableColors.indexOf(parsed.value) >= 0) {
    player.color = parsed.value;
    player.addToQueue({
      message: `Your colour is now [[;${
        player.color === 'black' ? 'grey' : player.color
      };]${player.color}].`,
    });
    game.players
      .filter((x) => x.id !== player.id)
      .forEach((x) =>
        x.addToQueue({
          message: `${player.name()} has changed color to [[;${
            player.color === 'black' ? 'grey' : player.color
          };]${player.color}]`,
        })
      );
  } else player.addToQueue(error('That colour is not available.'));
};
module.exports = changeColorCommand;
