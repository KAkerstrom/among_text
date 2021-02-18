const socket = io('http://kakerstrom.com:3000');
const commandTxt = document.getElementById('commandTxt');
const messageDiv = document.getElementById('messageDiv');
const usernameTxt = document.getElementById('usernameTxt');
const roomCodeTxt = document.getElementById('roomCodeTxt');
const joinBtn = document.getElementById('joinBtn');

// FUNCTIONS
const displayMessages = (msgList) => {
  console.log(msgList);
  if (!Array.isArray(msgList)) {
    console.error('Warning: Forgot to send msg as list.\n' + msgList.message);
    msgList = [msgList];
  }
  msgList.forEach((msg) => {
    if (msg.cls) clearScreen();
    if (msg.message) messageDiv.appendChild(chatDiv(msg));
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
  if (e.key === 'Enter' && !joinBtn.disabled) joinRoom();
});

document.getElementById('sendBtn').addEventListener('click', sendCommand);
joinBtn.addEventListener('click', () => {
  joinBtn.disabled = true;
  joinRoom();
});

// SOCKET EVENTS

socket.on('init_fail', (data) => {
  alert(
    `Error:
    ${(data && data[0] && data[0].message) || '[unknown error]'}`
  );
  joinBtn.disabled = false;
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
  usernameTxt.focus();
  joinBtn.disabled = false;
});

// SETUP CODE

populateInitInfo();
usernameTxt.focus();
usernameTxt.select();
