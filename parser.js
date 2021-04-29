const peg = require('pegjs');
const fs = require('fs');

let grammar = fs.readFileSync('./grammars/main.pegjs', 'utf8');
const mainParser = peg.generate(grammar);

module.exports = mainParser;
