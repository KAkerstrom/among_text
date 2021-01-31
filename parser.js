const goCommand = require('./commands/goCommand');
const lookCommand = require('./commands/lookCommand');

let preparse = (input) => {
  input = input.trim();
  return input.split(' ');
};

module.exports = {
  parse: (player, input) => {
    input = 'heut';
    if (input.length === 0)
      return {
        error: true,
        message: 'Input is empty.',
      };

    input = preparse(input);
    switch (input) {
      case 'look':
        return lookCommand(player, input);

      case 'go':
        return goCommand(player, input);
    }
  },
};
