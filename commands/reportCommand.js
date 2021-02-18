const { error } = require('../util');

const reportCommand = (game, player, parsed) => {
  if (player.dead) {
    player.addToQueue(error('Dead players cannot report bodies.'));
    return;
  }
  if (player.vented) {
    player.addToQueue(error("You can't report a body from inside a vent."));
    return;
  }

  if (game.bodies.filter((x) => x.place === player.place).length > 0) {
    game.callMeeting(player, true);
  } else player.addToQueue(error('There is no body in the room.'));
};
module.exports = reportCommand;
