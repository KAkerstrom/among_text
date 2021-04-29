const { error } = require('console');

// Show a different message to the imposter
// Account for sabotage elsewhere

const sabotageCommand = (game, player, parsed) => {
  if (!player.imposter) {
    player.addToQueue(error('Only the imposter can sabotage.'));
    return;
  }
  if (game.sabotageCooldown === 0) {
    switch (parsed.value) {
      case 'doors':
        game.activeSabotage = 'doors';
        game.sabotageCooldown = 2;
        game.players.forEach((x) =>
          x.addToQueue({
            message: '[[b;red;]The doors slam shut all around you!]',
          })
        );
        break;
      case 'reactor':
        game.activeSabotage = 'reactor';
        game.sabotageCooldown = 5;
        game.players.forEach((x) =>
          x.addToQueue({
            message: `[[b;red;]The reactor is critical! It will explode in ${game.sabotageCooldown} turns unless repaired!]`,
          })
        );
        break;
      case 'oxygen':
        game.activeSabotage = 'oxygen';
        game.sabotageCooldown = 6;
        game.players.forEach((x) =>
          x.addToQueue({
            message: `[[b;red;]The oxygen has been turned off! You will run out of oxygen in ${game.sabotageCooldown} turns!]`,
          })
        );
        break;
      case 'lights':
        game.activeSabotage = 'lights';
        game.sabotageCooldown = 5;
        game.players.forEach((x) =>
          x.addToQueue({
            message: `[[b;red;]The lights have gone out!]`,
          })
        );
        break;
      case 'communications':
        game.activeSabotage = 'communications';
        game.sabotageCooldown = 5;
        game.players.forEach((x) =>
          x.addToQueue({
            message: `[[b;red;]Communications are down!]`,
          })
        );
        break;
      case 'default':
        player.addToQueue(error('Unrecognized sabotage error, somehow?'));
    }
  } else {
    player.addToQueue(
      error(
        `You must wait ${game.sabotageCooldown} turn${
          game.sabotageCooldown === 1 ? '' : 's'
        } to sabotage.`
      )
    );
  }
};
module.exports = sabotageCommand;
