const waitCommand = (game, player, parsed) => {
  let action = {
    player,
    type: 'wait',
  };
  let message = game.addAction(action);
  if (message) player.addToQueue(message);
};
module.exports = waitCommand;
