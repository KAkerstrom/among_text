const { error } = require('./util');
const users = {};

const newUser = (socket) => {
  const user = {
    socket,
    id: socket.id,
    username: '',
    state: 'await_init',
    room: null,
    color: null,
    action: null,
  };
  users[socket.id] = user;
  return user;
};

const removeUser = (socketId) => {
  delete users[socketId];
};

const getUser = (socketId) => users[socketId] || null;

const setUsername = (socketId, username) => {
  if (!username) return { error: true, message: 'Username is required.' };
  if (!users[socketId])
    return error(
      "User doesn't exist. Please reestablish connection with server."
    );
  if (username.length < 3)
    return error('Username must be at least 3 characters long.');
  if (username.length > 16)
    return error('Username cannot be longer than 16 characters.');

  users[socketId].username = username;
  return { error: false, message: 'Hello, ' + username };
};

module.exports = {
  newUser,
  removeUser,
  getUser,
  setUsername,
};
