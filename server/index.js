var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.send('<h1>Hello World</h1>');
});

// IO functions
var users = [];   // { id, username }
const MESSAGE = {
  ATTACK: 'ATTACK',
  UNDER_ATTACK: 'UNDER_ATTACK',
  UPDATE_USER_LIST: 'UPDATE_USER_LIST'
}

io.on('connection', (socket) => {
  // An user connected
  // Send all user list of online user
  users.push({
    id:  socket.id,
    username: socket.handshake.query.username
  });
  io.emit(MESSAGE.UPDATE_USER_LIST, users);

  socket.on('disconnect', () => {
    // An user connected
    // Send all user list of online user
    const removeIndex = users.findIndex(user => user.id === socket.id);
    users.splice(removeIndex, 1);
    io.emit(MESSAGE.UPDATE_USER_LIST, users);
  });

  socket.on('client message', (msg) => {
    console.log('Client: ' + msg);
  });
});

http.listen(3000, () => {
  console.log('Listening on port 3000...');
});