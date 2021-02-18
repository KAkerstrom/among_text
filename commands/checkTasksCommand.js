const checkTasksCommand = (game, player, parsed) => {
  let message;
  if (player.imposter) message = 'Tasks:\n\n- Kill the crew.';
  else {
    console.log(player.tasks);
    message = `Tasks:\n
    ${player.tasks
      .map(
        (x) =>
          `-  ${x.place[0].toUpperCase()}${x.place.substring(1)}: ${
            x.description
          }`
      )
      .join('\n')}`;
  }
  player.addToQueue({ message });
};
module.exports = checkTasksCommand;
