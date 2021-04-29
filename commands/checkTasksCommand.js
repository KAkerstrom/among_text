const checkTasksCommand = (game, player, parsed) => {
  let message;
  if (player.imposter) message = 'Tasks:\n    - Kill the crew.';
  else {
    console.log(player.tasks);
    message = `Tasks:
    ${player.tasks
      .map(
        (x) =>
          `\n    -  ${x.place[0].toUpperCase()}${x.place.substring(1)}: ${
            x.description
          }`
      )
      .join()}`;
  }
  player.addToQueue({ message });
};
module.exports = checkTasksCommand;
