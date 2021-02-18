const skipCommand = (game, player, parsed) => {
  if (player.dead) {
    player.addToQueue({
      error: true,
      message: 'Dead players are not able to vote.',
    });
    return;
  }
  if (game.votes.find((x) => x.playerId === player.id)) {
    player.addToQueue({
      error: true,
      message: 'Your vote has already been cast.',
    });
    return;
  }
  game.votes.push({ player, vote: 'skip' });
  player.addToQueue({ message: 'You have skipped the vote.' });
  game.players
    .filter((x) => x.id !== player.id)
    .forEach((x) =>
      x.addToQueue({
        img: `profile/${player.color}`,
        imgSize: 32,
        message: `${player.username} (${player.color}) has cast their vote.`,
      })
    );

  if (game.votes.length === game.players.filter((x) => !x.dead).length)
    game.endMeeting();
};
module.exports = skipCommand;
