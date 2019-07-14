import { MESSAGE, SERVER, STATE } from './Config/config.js';
import Utilities from './Utilities/utilities.js';

export default class MySocket {
  socket;
  currentUser;
  users;
  state;

  constructor(username) {
    this.socket = io(`${SERVER.URL}?username=${username}`);
    this.state = STATE.USER_SELECT;

    this.handleLogin();
    this.handleUpdateUserList();
    this.handleChallengeRequest();
    this.handleChallengeCancel();
    this.handleChallengeReponse();
  }

  handleLogin() {
    let availableUserDiv = document.getElementById('available-user');
    this.socket.on(MESSAGE.LOGIN, (res) => {
      this.currentUser = res.currentUser;
      this.users = res.users;
      if (this.state === STATE.USER_SELECT) {
        availableUserDiv.style.display = 'block';
        Utilities.renderAvailableUsers(
          this.users.filter(user => user.id !== this.currentUser.id),
          (user) => {
            this.challenge(user.id);
          }
        );
      }
    });
  }

  handleUpdateUserList() {
    let availableUserDiv = document.getElementById('available-user');
    this.socket.on(MESSAGE.UPDATE_USER_LIST, (availUsers) => {
      this.users = availUsers;
      if (this.state === STATE.USER_SELECT) {
        availableUserDiv.style.display = 'block';
        Utilities.renderAvailableUsers(
          this.users.filter(user => user.id !== this.currentUser.id),
          (user) => {
            this.challenge(user.id);
          }
        );
      }
    });
  }

  challenge(opponentId) {
    let messageBox = document.getElementById('challenging-message');
    messageBox.style.display = 'block';

    this.socket.emit(MESSAGE.CHALLENGE, opponentId);
    let cancelButton = messageBox.getElementsByTagName('button')[0];
    cancelButton.addEventListener('click', () => this.cancelRequest(opponentId));
  }

  cancelRequest(opponentId) {
    let messageBox = document.getElementById('challenging-message');
    messageBox.style.display = 'none';

    this.socket.emit(MESSAGE.CHALLENGE_CANCEL, opponentId);
  }

  handleChallengeRequest() {
    this.socket.on(MESSAGE.CHALLENGE, (challenger) => {
      let messageBox = document.getElementById('challenging-question');
      messageBox.style.display = 'block';
      let message = messageBox.getElementsByClassName('message')[0];
      message.innerHTML = `${challenger.username} is challenging you to a game`;
      
      let acceptButton = document.getElementById('accept-btn');
      let rejectButton = document.getElementById('reject-btn');

      acceptButton.addEventListener('click', () => {
        this.socket.emit(MESSAGE.CHALLENGE_RESPONSE, challenger.id, true);
        messageBox.style.display = 'none';
        // GAME ON
        this.state = STATE.IN_GAME;
      });
      rejectButton.addEventListener('click', () => {
        this.socket.emit(MESSAGE.CHALLENGE_RESPONSE, challenger.id, false);
        messageBox.style.display = 'none';
      });
    });
  }

  handleChallengeReponse() {
    this.socket.on(MESSAGE.CHALLENGE_RESPONSE, (answer, opponent) => {
      let messageBox = document.getElementById('challenging-message');
      messageBox.style.display = 'none';
      
      if (answer) {
        // GAME ON
        this.state = STATE.IN_GAME;
      } else {
        messageBox = document.getElementById('challenging-reject');
        messageBox.style.display = 'block';
        let message = messageBox.getElementsByClassName('message')[0];
        message.innerHTML = `${opponent.username} has rejected your challenge`;
        let closeButton = messageBox.getElementsByTagName('button')[0];
        closeButton.addEventListener('click', () => {
          messageBox.style.display = 'none';
        });
      }
    });
  }

  handleChallengeCancel() {
    this.socket.on(MESSAGE.CHALLENGE_CANCEL, (challenger) => {
      let messageBox = document.getElementById('challenging-question');
      messageBox.style.display = 'none';
      messageBox = document.getElementById('challenging-cancel');
      messageBox.style.display = 'block';
      let message = messageBox.getElementsByClassName('message')[0];
      message.innerHTML = `${challenger.username} has canceled the challenge`;
      let closeButton = messageBox.getElementsByTagName('button')[0];
      closeButton.addEventListener('click', () => {
        messageBox.style.display = 'none';
      });
    });
  }

}