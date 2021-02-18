const { error } = require('../util');
const { map } = require('../constants');

const goLocationCommand = (game, player, parsed) => {
  if (player.vented) {
    if (map[player.place].vents.indexOf(parsed.value) >= 0) {
      player.place = parsed.value;
      player.addToQueue({
        message: `You quietly vent to ${player.place}.`,
      });
      player.addToQueue(game.lookMessage(player));
    } else
      player.addToQueue(
        error(`You can't vent to ${parsed.value} from here.
\nYou can vent to:
${map[player.place].vents.join('\n')}`)
      );
    return;
  } else {
    let exits = map[player.place].exits;
    for (let dir of Object.keys(exits)) {
      let exit = exits[dir];
      if (map[exit].aliases.indexOf(parsed.value) >= 0) {
        let action = {
          type: 'go',
          player,
          to: exit,
        };
        let message = game.addAction(action);
        if (message) player.addToQueue(message);
        return;
      }
    }
  }
  player.addToQueue(error(`${parsed.value} is not a valid exit.`));
};
module.exports = goLocationCommand;
