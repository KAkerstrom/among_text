const helpCommand = (game, player, parsed) => {
  let message = `Turn-ending Actions:
-  wait: Pass the turn without doing anything
-  go <room>: Go to an adjacent room

Free Actions:
-  help:  Display this message
-  look: Show information about the room
-  say <something>: Say something to others in the room`;
  if (player.imposter)
    message += `\n\n----------------------------\n
Turn-ending Imposter Actions:
-  vent: Enter a vent
-  kill <player>: Remove the life from another player

Free Imposter Actions:
-  vent: Only free when exiting!
-  go <room>: Only free if in a vent!`;
  player.addToQueue({ message });
};
module.exports = helpCommand;
