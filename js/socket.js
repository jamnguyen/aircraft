import { MESSAGE, SERVER, STATE } from './Config/config.js';
import Utilities from './Utilities/utilities.js';

export default class MySocket {
  socket;
  currentUser;
  opponentUser;
  users;
  game;

  constructor(username, gameManager) {
    this.socket = io(`${SERVER.URL}?username=${username}`);
    this.game = gameManager;
  }

  stopListeningOnState(state) {
    if (state === STATE.USER_SELECT) {
      this.socket.removeAllListeners(MESSAGE.US_LOGIN);
      this.socket.removeAllListeners(MESSAGE.US_CHALLENGE);
      this.socket.removeAllListeners(MESSAGE.US_CHALLENGE_CANCEL);
      this.socket.removeAllListeners(MESSAGE.US_CHALLENGE_RESPONSE);
      this.socket.removeAllListeners(MESSAGE.US_UPDATE_USER_LIST);
    }
  }

  // ----------------------------------------------------------------------------------
  // STATE USER SELECT
  // ----------------------------------------------------------------------------------
  setupStateUserSelect() {
    this.handleLogin();
    this.handleUpdateUserList();
    this.handleChallengeRequest();
    this.handleChallengeCancel();
    this.handleChallengeReponse();
  }

  handleLogin() {
    let availableUserDiv = document.getElementById('available-users');
    this.socket.on(MESSAGE.US_LOGIN, (res) => {
      this.currentUser = res.currentUser;
      this.users = res.users;
      availableUserDiv.classList.remove('hidden');
      Utilities.renderAvailableUsers(
        this.users.filter(user => user.id !== this.currentUser.id),
        (user) => {
          this.challenge(user.id);
        }
      );
    });
  }

  challenge(opponentId) {
    let messageBox = document.getElementById('challenging-message');
    messageBox.classList.remove('hidden');

    this.socket.emit(MESSAGE.US_CHALLENGE, opponentId);
    let cancelButton = messageBox.getElementsByTagName('button')[0];
    cancelButton.addEventListener('click', () => this.cancelRequest(opponentId));
  }

  cancelRequest(opponentId) {
    let messageBox = document.getElementById('challenging-message');
    messageBox.classList.add('hidden');

    this.socket.emit(MESSAGE.US_CHALLENGE_CANCEL, opponentId);
  }

  handleUpdateUserList() {
    let availableUserDiv = document.getElementById('available-users');
    this.socket.on(MESSAGE.US_UPDATE_USER_LIST, (availUsers) => {
      this.users = availUsers;
      availableUserDiv.classList.remove('hidden');
      Utilities.renderAvailableUsers(
        this.users.filter(user => user.id !== this.currentUser.id),
        (user) => {
          this.challenge(user.id);
        }
      );
    });
  }

  handleChallengeRequest() {
    this.socket.on(MESSAGE.US_CHALLENGE, (challenger) => {
      let messageBox = document.getElementById('challenging-question');
      messageBox.classList.remove('hidden');
      let message = messageBox.getElementsByClassName('message')[0];
      message.innerHTML = `${challenger.username} is challenging you to a game`;
      
      let acceptButton = document.getElementById('accept-btn');
      let rejectButton = document.getElementById('reject-btn');

      acceptButton.addEventListener('click', () => {
        this.socket.emit(MESSAGE.US_CHALLENGE_RESPONSE, challenger.id, true);
        messageBox.classList.add('hidden');
        // GAME ON
        this.opponentUser = challenger;
        document.getElementById('available-users').classList.add('hidden');
        this.stopListeningOnState(STATE.USER_SELECT);
        this.game.setState(STATE.IN_GAME_SETUP);
      });
      rejectButton.addEventListener('click', () => {
        this.socket.emit(MESSAGE.US_CHALLENGE_RESPONSE, challenger.id, false);
        messageBox.classList.add('hidden');
      });
    });
  }

  handleChallengeReponse() {
    this.socket.on(MESSAGE.US_CHALLENGE_RESPONSE, (answer, opponent) => {
      let messageBox = document.getElementById('challenging-message');
      messageBox.classList.add('hidden');
      
      if (answer) {
        // GAME ON
        this.opponentUser = opponent;
        document.getElementById('available-users').classList.add('hidden');
        this.stopListeningOnState(STATE.USER_SELECT);
        this.game.setState(STATE.IN_GAME_SETUP);
      } else {
        messageBox = document.getElementById('challenging-reject');
        messageBox.classList.remove('hidden');
        let message = messageBox.getElementsByClassName('message')[0];
        message.innerHTML = `${opponent.username} has rejected your challenge`;
        let closeButton = messageBox.getElementsByTagName('button')[0];
        closeButton.addEventListener('click', () => {
          messageBox.classList.add('hidden');
        });
      }
    });
  }

  handleChallengeCancel() {
    this.socket.on(MESSAGE.US_CHALLENGE_CANCEL, (challenger) => {
      let messageBox = document.getElementById('challenging-question');
      messageBox.classList.add('hidden');
      messageBox = document.getElementById('challenging-cancel');
      messageBox.classList.remove('hidden');
      let message = messageBox.getElementsByClassName('message')[0];
      message.innerHTML = `${challenger.username} has canceled the challenge`;
      let closeButton = messageBox.getElementsByTagName('button')[0];
      closeButton.addEventListener('click', () => {
        messageBox.classList.add('hidden');
      });
    });
  }

}