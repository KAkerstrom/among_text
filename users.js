const { error } = require('./util');
const users = {};

class User {
  constructor(socket) {
    this.socket = socket;
    this.id = socket.id;
    this.username = 'undefined';
    this.state = 'await_init';
    this.room = null;
    this.color = null;
    this.action = null;
    this.queue = [];
    this.vented = false;
  }

  setUsername(username) {
    if (!username) return error('Username is required.');
    if (username.length < 3)
      return error('Username must be at least 3 characters long.');
    if (username.length > 16)
      return error('Username cannot be longer than 16 characters.');

    this.username = username;
    return { message: `Hello, ${username}.` };
  }

  addToQueue(message) {
    this.queue.push(message);
  }

  flushQueue() {
    this.socket.emit('msg', this.queue);
    this.queue = [];
  }
}

const newUser = (socket) => {
  const user = new User(socket);
  users[socket.id] = user;
  return user;
};

const removeUser = (socketId) => {
  delete users[socketId];
};

const getUser = (socketId) => users[socketId] || null;

module.exports = {
  newUser,
  removeUser,
  getUser,
};
