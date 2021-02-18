const peg = require('pegjs');
const fs = require('fs');

let grammar = fs.readFileSync('./grammars/main.pegjs', 'utf8');
const mainParser = peg.generate(grammar);

grammar = fs.readFileSync('./grammars/lobby.pegjs', 'utf8');
const lobbyParser = peg.generate(grammar);

grammar = fs.readFileSync('./grammars/meeting.pegjs', 'utf8');
const meetingParser = peg.generate(grammar);

module.exports = { mainParser, lobbyParser, meetingParser };
