const { error } = require('../util');
const { tasks } = require('../constants');

const sayCommand = (game, player, parsed) => {
  const task = player.tasks.find(
    (x) =>
      parsed.id ===
      (x.id.indexOf(':') >= 0 ? x.id.substring(0, x.id.indexOf(':')) : x.id)
  );
  console.log(task);
  if (!task) {
    player.addToQueue(error("You don't currently have that task."));
    return;
  }
  if (player.place !== task.place) {
    player.addToQueue(
      error(
        `You need to be in ${task.place[0] + task.place.substring(1)}${
          task.place === 'lower' || task.place === 'upper' ? ' Reactor' : ''
        } to perform that task.`
      )
    );
    return;
  }

  // Special cases
  if (task.id === 'inspect_samples' && player.samplesCooldown > 0) {
    player.addToQueue(
      error(
        `You still need to wait ${player.samplesCooldown} turn${
          player.samplesCooldown === 1 ? '' : 's'
        } before inspecting the samples.`
      )
    );
    return;
  }
  if (task.id === 'prepare_samples') player.samplesCooldown = 5;

  player.addToQueue({ message: task.successMsg });
  if (task.next) {
    const nextTask = { ...tasks.find((x) => x.id === task.next) };
    if (Array.isArray(nextTask.place))
      nextTask.place =
        nextTask.place[Math.floor(Math.random() * t.place.length)];
    player.tasks.push(nextTask);
  }
  player.tasks = player.tasks.filter((x) => x.id !== task.id);
  if (player.tasks.length === 0)
    player.addToQueue({ message: "You're done all your tasks! Well done!" });
};
module.exports = sayCommand;
