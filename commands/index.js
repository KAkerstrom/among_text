const help = require('./helpCommand');
const wait = require('./waitCommand');
const look = require('./lookCommand');
const go_cardinal = require('./goCardinalCommand');
const go_location = require('./goLocationCommand');
const vent = require('./ventCommand');
const say = require('./sayCommand');
const kill = require('./killCommand');
const report = require('./reportCommand');
const start = require('./startCommand');
const vote = require('./voteCommand');
const skip = require('./skipCommand');
const task = require('./taskCommand');
const check_tasks = require('./checkTasksCommand');
const change_color = require('./changeColorCommand');
const sabotage = require('./sabotageCommand');
const press_button = require('./pressButtonCommand');

module.exports = {
  lobby: { say, help, start, change_color },
  main: {
    say,
    help,
    wait,
    look,
    go_cardinal,
    go_location,
    vent,
    kill,
    report,
    task,
    check_tasks,
    sabotage,
    press_button,
  },
  meeting: { say, help, vote, skip },
};
