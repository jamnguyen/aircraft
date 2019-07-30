var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.send('<h1>This is Jam Aircraft Server</h1>');
});

// IO functions
var users = [];   // { id, username }
const MESSAGE = {
  DISCONNECTED: 'DISCONNECTED',

  // STATE USER SELECT
  US_LOGIN: 'LOGIN',
  US_CHALLENGE: 'US_CHALLENGE',
  US_CHALLENGE_CANCEL: 'US_CHALLENGE_CANCEL',
  US_CHALLENGE_RESPONSE: 'US_CHALLENGE_RESPONSE',
  US_UPDATE_USER_LIST: 'US_UPDATE_USER_LIST',
  US_GET_USER_LIST: 'US_GET_USER_LIST',

  // STATE GAME SETUP
  GS_DONE_SETUP: 'GS_DONE_SETUP',

  // STATE IN GAME
  IG_ATTACK: 'IG_ATTACK',
  IG_ATTACK_RESPONSE: 'IG_ATTACK_RESPONSE',
  IG_RESIGN: 'IG_RESIGN',
  IG_ENDGAME: 'IG_ENDGAME'
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

  // Send available users when requested
  socket.on(MESSAGE.US_GET_USER_LIST, () => {
    io.to(`${socket.id}`).emit(MESSAGE.US_UPDATE_USER_LIST, users.filter(user => user.status === STATUS.AVAILABLE));
  });

  // User request a game with user has opponentId
  socket.on(MESSAGE.US_CHALLENGE, (opponentId) => {
    const challenger = users.find(user => user.id === socket.id);
    const opponent = users.find(user => user.id === opponentId);

    if (challenger) {
      challenger.status = opponentId;
    }
    if (opponent) {
      opponent.status = challenger.id;
    }

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

    if (challenger) {
      challenger.status = STATUS.AVAILABLE;
    }
    if (opponent) {
      opponent.status = STATUS.AVAILABLE;
    }

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
      if (challenger) {
        challenger.status = STATUS.AVAILABLE;
      }
      if (opponent) {
        opponent.status = STATUS.AVAILABLE;
      }
    } else {
      if (challenger) {
        challenger.status = opponent.id;
      }
      if (opponent) {
        opponent.status = challenger.id;
      }
    }

    io.to(`${challenger.id}`).emit(
      MESSAGE.US_CHALLENGE_RESPONSE,
      answer,
      opponent
    );

    io.emit(MESSAGE.US_UPDATE_USER_LIST, users.filter(user => user.status === STATUS.AVAILABLE));
  });

  // User done setup
  socket.on(MESSAGE.GS_DONE_SETUP, () => {
    const user = users.find(item => item.id === socket.id);
    if (!user || user.status === STATUS.AVAILABLE) {
      return;
    }
    const opponent = users.find(item => item.id === user.status);
    if (opponent) {
      io.to(`${opponent.id}`).emit(MESSAGE.GS_DONE_SETUP);
    }
  });

  //User attack
  socket.on(MESSAGE.IG_ATTACK, bullet => {
    const user = users.find(item => item.id === socket.id);
    if (!user || user.status === STATUS.AVAILABLE) {
      return;
    }

    io.to(user.status).emit(MESSAGE.IG_ATTACK, bullet);
  });

  //User return attack result
  socket.on(MESSAGE.IG_ATTACK_RESPONSE, bullet => {
    const user = users.find(item => item.id === socket.id);
    if (!user || user.status === STATUS.AVAILABLE) {
      return;
    }

    io.to(user.status).emit(MESSAGE.IG_ATTACK_RESPONSE, bullet);
  });

  //User resign
  socket.on(MESSAGE.IG_RESIGN, () => {
    const user = users.find(item => item.id === socket.id);
    if (!user || user.status === STATUS.AVAILABLE) {
      return;
    }

    io.to(user.status).emit(MESSAGE.IG_RESIGN);
  });

  // User end game
  socket.on(MESSAGE.IG_ENDGAME, () => {
    const user = users.find(item => item.id === socket.id);
    if (!user) {
      return;
    }
    user.status = STATUS.AVAILABLE;
    io.emit(MESSAGE.US_UPDATE_USER_LIST, users.filter(user => user.status === STATUS.AVAILABLE));
  });

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
      const opponent = users.find(user => user.id === disconnectedUser.status);
      if (opponent) {
        opponent.status = STATUS.AVAILABLE;
      }
      io.to(disconnectedUser.status).emit(
        MESSAGE.DISCONNECTED,
        disconnectedUser
      );
    }

    // Send to other users available users list
    users.splice(removeIndex, 1);
    io.emit(MESSAGE.US_UPDATE_USER_LIST, users.filter(user => user.status === STATUS.AVAILABLE));
  });
});

http.listen(3000, () => {
  console.log('Listening on port 3000...');
});