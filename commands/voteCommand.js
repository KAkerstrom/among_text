const { error } = require('../util');

const voteCommand = (game, player, parsed) => {
  if (game.state !== 'meeting') {
    player.addToQueue(error('You can only vote during a meeting.'));
    return;
  }
  if (player.dead) {
    player.addToQueue(error('Dead players are not able to vote.'));
    return;
  }
  if (game.votes.find((x) => x.player.id === player.id)) {
    player.addToQueue(error('Your vote has already been cast.'));
    return;
  }
  const vote = game.players.find(
    (x) =>
      x.username.toLowerCase() === parsed.value ||
      x.color.toLowerCase() === parsed.value
  );
  if (!vote) {
    player.addToQueue(error(`${parsed.value} is not a user or colour.`));
    return;
  }
  if (vote.dead) {
    player.addToQueue(
      error(`${vote.name('dead')} is dead, and thus exempt from voting.`)
    );
    return;
  }

  game.votes.push({ player, vote });
  player.addToQueue({
    img: `profile/${player.color}`,
    imgSize: 32,
    message: `You have cast a vote for ${vote.name()}.`,
  });
  game.players
    .filter((x) => x.id !== player.id)
    .forEach((x) =>
      x.addToQueue({
        //img: `profile/${player.color}`,
        imgSize: 32,
        message: `${player.name()} has cast their vote.`,
      })
    );
  if (game.votes.length === game.players.filter((x) => !x.dead).length)
    game.endMeeting();
};
module.exports = voteCommand;
