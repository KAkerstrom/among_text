const { error } = require('console');

const pressButtonCommand = (game, player, parsed) => {
  if (player.place !== 'cafeteria') {
    player.addToQueue(
      error('You need to be in the cafeteria to press the button.')
    );
    return;
  }
  if (player.meetings > 0) {
    game.callMeeting(false);
  } else {
    player.addToQueue(error("You've already used all your meetings."));
    return;
  }
};
module.exports = pressButtonCommand;
