const sayCommand = (game, player, parsed) => {
  player.color = 'black';
  let message = {
    type: 'chat',
    username: player.username + (player.dead ? ' (dead)' : ''),
    img: `profile/${player.color}`,
    message: `${player.displayName} ${parsed.value.replace('[[', '[ [')}`,
  };
  game.players
    .filter((x) => x.place === player.place && (x.dead || !player.dead))
    .forEach((x) => x.addToQueue(message));
};
module.exports = sayCommand;
