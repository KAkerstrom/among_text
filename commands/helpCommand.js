const helpCommand = (game, player, parsed) => {
  let message;

  if (game.state === 'lobby') {
    message = `Commands:
  say <something> ....... Say something to the lobby
  colour <colour> ....... Change your character's colour`;
    if (game.host === player.id)
      message += '\n  start game ............ Start the game!';
  } else if (game.state === 'meeting') {
    message = `Commands:
  say <something> ....... Say something to the lobby
  vote <player> ......... Vote for a player as imposter
  skip vote ............. Skip the vote`;
  } else {
    message = `Turn-ending Commands:
  wait .............. Pass the turn without doing anything
  go <room> ......... Go to an adjacent room`;
    if (player.imposter && !player.vented)
      message +=
        '\n  vent .............. Enter a vent - once inside, moving and leaving the vent are free';
    if (!player.imposter)
      '\n  [task phrase] ..... Type a task phrase in the correct room to complete the task';

    message += `\n\nFree Commands:
  help .............. Display this message
  look .............. Show information about the room
  report ............ Report a dead body in the room (will interrupt all actions)
  say <something> ... Say something to others in the room`;

    if (player.imposter && player.vented)
      message += `\n  vent .............. Exit the vent (only free when exiting)
  go <room> ......... Travel the vents to another room`;
    if (!player.imposter)
      message +=
        '\n  tasks ............. View your task phrases and where to complete them';
  }
  player.addToQueue({ message });
};
module.exports = helpCommand;
