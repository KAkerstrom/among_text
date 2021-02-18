const socket = io('http://kakerstrom.com:3000');
let connecting = false;
let connected = false;
let username = null;
let roomCode = null;
const term = $('#terminal').terminal(
  function (command) {
    if (!username) {
      username = command;
      term.set_prompt('room code: ');
    } else if (!roomCode) {
      term.set_prompt('logging in...');
      roomCode = command;
      connecting = true;
      socket.emit('init', { username, roomCode });
    } else if (!connecting && connected)
      socket.emit('command', { message: command });
  },
  {
    greetings: `
 　ﾟ    [[;white;]ඞ]            。                   　ﾟ          [[;blue;]ඞ]         。
     ▄▄▄   •   ███▄ ▄███▓ ▒█████   ███▄    █   ▄████  •  █    ██   ██████ 　ﾟ
    ▒████▄    ▓██▒▀█▀ ██▒▒██▒  ██▒ ██ ▀█   █  ██▒ ▀█▒    ██  ▓██▒▒██    ▒    。 
 •  ▒██  ▀█▄  ▓██    ▓██░▒██░  ██▒▓██  ▀█ ██▒▒██░▄▄▄░   ▓██ •▒██░░ ▓██▄   
    ░██▄▄▄▄██ ▒██  • ▒██ ▒██   ██░▓██▒  ▐▌██▒░▓█  ██▓   ▓▓█  ░██░  ▒   ██▒  •
     ▓█   ▓██▒▒██▒   ░██▒░ ████▓▒░▒██░   ▓██░░▒▓███▀▒   ▒▒█████▓ ▒██████▒▒
  •  ▒▒   ▓▒█░░ ▒░   ░  ░░ ▒░▒░▒░ ░ ▒░   ▒ ▒  ░▒   ▒    ░▒▓▒ ▒ ▒ ▒ ▒▓▒ ▒ ░
      ▒ [[;red;]ඞ]▒▒ ░░  ░      ░  ░ ▒ ▒░ ░ ░░   ░ ▒░  ░   ░    ░░▒░ ░ ░ ░ ░▒  ░ ░ 　ﾟ
      ░   ▒• ░      ░   ░ ░ ░ ▒     ░ [[;yellow;]ඞ] ░ ░ ░ ░   ░  •  ░░░ ░ ░ ░  ░  ░   
          ░  ░      ░       ░ ░  •        ░       ░       ░           ░  [[;pink;]ඞ]
          　ﾟ             。                     。                　ﾟ         •
          `,
  }
);
term.set_prompt('username: ');

// // term.read('username: ').then((res) => (username = res));
// // term.read('room code: ').then((res) => (roomCode = res));

// // let test = $(
// // //   '<img src="./img/profile/red.png" style="display: inline-block" />'
// // // );
// // // term.echo(test, { newline: false });
// term.echo('[[@;;;;./img/profile/red.png]] ', {
//   finalize: function (div) {
//     div
//       .find('img')
//       .css('float', 'left')
//       .css('width', '1rem')
//       .css('height', '1rem');
//   },
// });
// term.echo('test');
// // [
// //   'red',
//   'blue',
//   'green',
//   'pink',
//   'orange',
//   'yellow',
//   'black',
//   'white',
//   'purple',
//   'brown',
//   'cyan',
//   'lime',
// ].forEach((x) => term.echo('[[b;' + x + ';] test]'));
// //term.echo('test');

socket.on('init_fail', (data) => {
  connecting = connected = false;
  term.echo(`Error:
${(data && data[0] && data[0].message) || '[unknown error]'}`);
  term.echo('');
  username = roomCode = null;
  term.set_prompt('username: ');
});

socket.on('init_success', (data) => {
  connecting = false;
  connected = true;
  term.set_prompt('> ');
  data.forEach((x) => {
    if (x.cls) term.clear();
    term.echo(x.message || '');
  });
  term.echo('');
});

socket.on('msg', (data) => {
  data.forEach((x) => {
    if (x.cls) term.clear();
    if (x.img) x.message = `[[@;;;;./img/${x.img}.png]] ${x.message || ''}`;
    term.echo(x.message || '', {
      finalize: function (div) {
        if (div.find('img'))
          div
            .find('img')
            .css('float', 'left')
            .css('width', '1em')
            .css('height', '1em');
      },
    });
  });
  term.echo('');
});

socket.on('disconnect', (data) => {
  connecting = connected = false;
  term.clear();
  term.echo('Server disconnect...');
  term.echo('');
  username = roomCode = null;
  term.set_prompt('username: ');
});
