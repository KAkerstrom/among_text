const users = {};
const rooms = {};

const newUser = (socketId) => {
  const user = {
    id: socketId,
    username: '',
    state: 'await_init',
    room: null,
  };
  users[socketId] = user;
  return user;
};

const getUser = (socketId) => users[socketId] || null;

const joinRoom = (socketId, roomName) => {
  if (!users[socketId])
    return {
      error: true,
      message: "User doesn't exist. Please reestablish connection with server.",
    };
  if (roomName.length < 3)
    return {
      error: true,
      message: 'Room names cannot be less than 3 characters.',
    };
  if (roomName.length > 16)
    return {
      error: true,
      message: 'Room names cannot be longer than 16 characters.',
    };

  users[socketId].room = roomName;
  if (rooms[roomName]) {
    rooms[roomName].players.push(socketId);
    return { message: 'Joined room lobby: ' + roomName };
  } else {
    rooms[roomName] = {
      players: [socketId],
      id: roomName,
    };
    return { message: 'Created new lobby: ' + roomName };
  }
};

const leaveRoom = (socketId) => {
  let user = users[socketId];
  if (!user) return;
  let room = rooms[user.room];
  if (!room) return;

  if (room.players.length > 1) {
    room.players = room.players.filter((x) => x != socketId);
  } else {
    delete rooms[room.id];
  }
};

const getRoom = (room) => {
  return rooms[room] || null;
};

const setUsername = (socketId, username) => {
  if (!users[socketId])
    return {
      error: true,
      message: "User doesn't exist. Please reestablish connection with server.",
    };
  if (username.length < 3)
    return {
      error: true,
      message: 'Username must be at least 3 characters long.',
    };
  if (username.length > 16)
    return {
      error: true,
      message: 'Username cannot be longer than 16 characters.',
    };

  users[socketId].username = username;
  return { error: false, message: 'Hello, ' + username };
};

module.exports = {
  newUser,
  getUser,
  joinRoom,
  leaveRoom,
  getRoom,
  setUsername,
};
