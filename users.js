const { error } = require('./util');
const { colors } = require('./constants');
const { match } = require('assert');
const users = {};

class User {
  constructor(socket) {
    this.socket = socket;
    this.id = socket.id;
    this.username = 'undefined';
    this.state = 'await_init';
    this.room = null;
    this.color = null;
    this.queue = [];
    this.imposter = false;
    this.vented = false;
    this.dead = false;
    this.killCooldown = 0;
    this.samplesCooldown = 0;
    this.place = 'cafeteria';
  }

  reset() {
    this.imposter = false;
    this.vented = false;
    this.dead = false;
    this.killCooldown = 0;
    this.samplesCooldown = 0;
    this.place = 'cafeteria';
  }

  get displayName() {
    return `[[@;;;;./img/profile/${this.color}.png]][[b;${
      this.color === 'black' ? 'grey' : this.color
    };]${this.username}:]`;
  }

  setUsername(username) {
    if (!username) return error('Username is required.');
    if (username.length < 3)
      return error('Username must be at least 3 characters long.');
    if (username.length > 16)
      return error('Username cannot be longer than 16 characters.');
    if (!new RegExp('^[a-zA-Z0-9-_]+$').test(username))
      return error('Username can only contain letters, -, or _. (no spaces)');
    if (colors.indexOf(username.toLowerCase()) >= 0)
      return error('Username cannot be a colour.');

    this.username = username;
    return { message: `Hello, ${username}.` };
  }

  addToQueue(message) {
    if (Array.isArray(message)) this.queue = this.queue.concat(message);
    else this.queue.push(message);
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
