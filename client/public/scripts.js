const socket = io('http://kakerstrom.com:3000');
const commandTxt = document.getElementById('commandTxt');
const messageDiv = document.getElementById('messageDiv');
const usernameTxt = document.getElementById('usernameTxt');
const roomCodeTxt = document.getElementById('roomCodeTxt');

// FUNCTIONS

const displayMessages = (msgList) => {
  msgList.forEach((msg) => {
    if (msg.cls) clearScreen();
    if (msg.message) {
      const div = document.createElement('div');
      div.className = 'mb-2';
      div.style.backgroundColor = msg.bgColor || 'darkslategrey';
      div.style.color = msg.textColor || 'white';

      const message = document.createElement('p');
      message.className = 'm-2';
      message.innerText = msg.message;

      div.appendChild(message);
      messageDiv.appendChild(div);
    }
  });
  messageDiv.scrollTop = messageDiv.scrollHeight;
};

const clearScreen = () => {
  messageDiv.textContent = '';
};

const sendCommand = () => {
  if (commandTxt.value !== '') {
    socket.emit('command', { message: commandTxt.value });
    commandTxt.value = '';
  }
  commandTxt.focus();
};

const joinRoom = () => {
  const username = usernameTxt.value;
  const roomCode = roomCodeTxt.value;
  localStorage.setItem('username', username);
  socket.emit('init', { username, roomCode });
};

const populateInitInfo = () => {
  let roomFromUrl = new URL(window.location.href).pathname
    .substring('/room/'.length)
    .replace('/', '');

  usernameTxt.value = localStorage.getItem('username') || '';
  roomCodeTxt.value = roomFromUrl;
};

// EVENT LISTENERS

commandTxt.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendCommand();
});

usernameTxt.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') roomCodeTxt.focus();
});

roomCodeTxt.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') joinRoom();
});

document.getElementById('joinBtn').addEventListener('click', joinRoom);
document.getElementById('sendBtn').addEventListener('click', sendCommand);

// SOCKET EVENTS

socket.on('init_fail', (data) => {
  alert(
    '(Proper error alerts to come)\nThere was an error joining the room. View console for details.'
  );
  console.log(data);
});

socket.on('init_success', (data) => {
  clearScreen();
  displayMessages(data);
  document.getElementById('init').style.display = 'none';
  document.getElementById('game').style.display = 'block';
  commandTxt.focus();
});

socket.on('msg', (data) => {
  displayMessages(data);
});

socket.on('disconnect', (data) => {
  alert('Server disconnect...');
  document.getElementById('init').style.display = 'block';
  document.getElementById('game').style.display = 'none';
});

// SETUP CODE

populateInitInfo();
usernameTxt.focus();
usernameTxt.select();
