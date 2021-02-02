const peg = require('pegjs');
const fs = require('fs');
const grammar = fs.readFileSync('./mainGrammar.pegjs', 'utf8');
var parser = peg.generate(grammar);
module.exports = parser;
