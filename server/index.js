var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.send('<h1>This is Jam Aircraft Server</h1>');
});

// IO functions
var users = [];   // { id, username }
const MESSAGE = {
  // STATE USER SELECT
  US_LOGIN: 'LOGIN',
  US_CHALLENGE: 'US_CHALLENGE',
  US_CHALLENGE_CANCEL: 'US_CHALLENGE_CANCEL',
  US_CHALLENGE_RESPONSE: 'US_CHALLENGE_RESPONSE',
  US_UPDATE_USER_LIST: 'US_UPDATE_USER_LIST',

  // STATE IN GAME
  IG_ATTACK: 'IG_ATTACK',
  IG_UNDER_ATTACK: 'IG_UNDER_ATTACK',
}
const STATUS = {
  AVAILABLE: 'AVAILABLE',
  CHALLENGING: 'CHALLENGING',
  IN_GAME: 'IN_GAME'
}

io.on('connection', (socket) => {
  users.push({
    id:  socket.id,
    username: socket.handshake.query.username,
    status: STATUS.AVAILABLE
  });

  // Send to connected user id and available users list
  io.to(`${socket.id}`).emit(
    MESSAGE.US_LOGIN,
    {
      currentUser: {
        id:  socket.id,
        username: socket.handshake.query.username,
      },
      users: users.filter(user => user.status === STATUS.AVAILABLE)
    }
  );

  // Send to other users available users list
  socket.broadcast.emit(
    MESSAGE.US_UPDATE_USER_LIST,
    users.filter(user => user.status === STATUS.AVAILABLE)
  );

  // User disconnect
  socket.on('disconnect', () => {
    let removeIndex = -1;
    const disconnectedUser = users.find((user, index) => {
      if (user.id === socket.id) {
        removeIndex = index;
        return true;
      }
      return false;
    });

    if (disconnectedUser.status !== STATUS.AVAILABLE) {
      // @TO DO: Handle in game disconnected
    }

    // Send to other users available users list
    users.splice(removeIndex, 1);
    io.emit(MESSAGE.US_UPDATE_USER_LIST, users.filter(user => user.status === STATUS.AVAILABLE));
  });

  // User request a game with user has opponentId
  socket.on(MESSAGE.US_CHALLENGE, (opponentId) => {
    const challenger = users.find(user => user.id === socket.id);
    const opponent = users.find(user => user.id === opponentId);

    challenger.status = STATUS.CHALLENGING;
    opponent.status = STATUS.CHALLENGING;

    io.to(`${opponentId}`).emit(
      MESSAGE.US_CHALLENGE,
      challenger
    );

    io.emit(MESSAGE.US_UPDATE_USER_LIST, users.filter(user => user.status === STATUS.AVAILABLE));
  });

  // User cancel game request with user has opponentId
  socket.on(MESSAGE.US_CHALLENGE_CANCEL, (opponentId) => {
    const challenger = users.find(user => user.id === socket.id);
    const opponent = users.find(user => user.id === opponentId);

    challenger.status = STATUS.AVAILABLE;
    opponent.status = STATUS.AVAILABLE;

    io.to(`${opponentId}`).emit(
      MESSAGE.US_CHALLENGE_CANCEL,
      challenger
    );

    io.emit(MESSAGE.US_UPDATE_USER_LIST, users.filter(user => user.status === STATUS.AVAILABLE));
  });

  // User response to a challenge
  socket.on(MESSAGE.US_CHALLENGE_RESPONSE, (challengerId, answer) => {
    const challenger = users.find(user => user.id === challengerId);
    const opponent = users.find(user => user.id === socket.id);
  
    if (!answer) {
      challenger.status = STATUS.AVAILABLE;
      opponent.status = STATUS.AVAILABLE;
    } else {
      challenger.status = opponent.id;
      opponent.status = challenger.id;
    }

    io.to(`${challenger.id}`).emit(
      MESSAGE.US_CHALLENGE_RESPONSE,
      answer,
      opponent
    );

    io.emit(MESSAGE.US_UPDATE_USER_LIST, users.filter(user => user.status === STATUS.AVAILABLE));
  });
});

http.listen(3000, () => {
  console.log('Listening on port 3000...');
});