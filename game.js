const parser = require('./parser');

const games = {};

module.exports = class game {
  players = [];
  state = 'lobby';
  rooms = {
    cafeteria: {
      exits: {
        s: 'admin',
        w: 'medical',
        e: 'weapons',
      },
    },
    admin: {
      exits: {
        n: 'cafeteria',
      },
    },
    medical: {
      exits: {
        e: 'cafeteria',
      },
    },
    weapons: {
      exits: {
        w: 'cafeteria',
      },
    },
  };
  processPlayerInput = (player, input) => {
    parser.parse(player, input);
  };
};
