var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.send('<h1>This is Jam Aircraft Server</h1>');
});

// IO functions
var users = [];   // { id, username }
const MESSAGE = {
  ATTACK: 'ATTACK',
  UNDER_ATTACK: 'UNDER_ATTACK',
  UPDATE_USER_LIST: 'UPDATE_USER_LIST',
  LOGIN: 'LOGIN'
}

io.on('connection', (socket) => {
  // An user connected
  // Send all user list of online user
  users.push({
    id:  socket.id,
    username: socket.handshake.query.username,
    inGame: false
  });
  io.to(`${socket.id}`).emit(
    MESSAGE.LOGIN,
    {
      currentUser: {
        id:  socket.id,
        username: socket.handshake.query.username,
      },
      users: users.filter(user => !user.inGame)
    }
  );

  socket.broadcast.emit(
    MESSAGE.UPDATE_USER_LIST,
    users.filter(user => !user.inGame)
  );

  socket.on('disconnect', () => {
    // An user connected
    // Send all user list of online user
    const removeIndex = users.findIndex(user => user.id === socket.id);
    users.splice(removeIndex, 1);
    io.emit(MESSAGE.UPDATE_USER_LIST, users.filter(user => !user.inGame));
  });

  socket.on('client message', (msg) => {
    console.log('Client: ' + msg);
  });
});

http.listen(3000, () => {
  console.log('Listening on port 3000...');
});