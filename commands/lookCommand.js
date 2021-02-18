const lookCommand = (game, player, parsed) => {
  player.addToQueue(game.lookMessage(player));
};
module.exports = lookCommand;
