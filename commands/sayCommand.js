const sayCommand = (game, player, parsed, rawInput) => {
  // remove "say " from raw input
  rawInput = rawInput.replace('[[', '[ [ ');
  rawInput = rawInput.substring(4);
  let message = {
    type: 'chat',
    username: player.username + (player.dead ? ' (dead)' : ''),
    //img: `profile/${player.color}`,
    message: `${player.name(player.dead ? 'dead' : null)}${
      player.dead ? ' (dead)' : ''
    }: ${rawInput}`,
  };
  game.players
    .filter((x) => x.place === player.place && (x.dead || !player.dead))
    .forEach((x) => x.addToQueue(message));

  console.log('wehwehweh');
};
module.exports = sayCommand;
