import { MESSAGE, SERVER, STATE, TEXT } from './Config/config.js';
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
    } else if (state === STATE.GAME_SETUP) {
      this.socket.removeAllListeners(MESSAGE.DISCONNECTED);
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
    this.handleChallengingDisconnected();
    this.requestUserList();
  }

  handleLogin() {
    this.socket.on(MESSAGE.US_LOGIN, (res) => {
      this.currentUser = res.currentUser;
      this.users = res.users;
      Utilities.renderAvailableUsers(
        this.users.filter(user => user.id !== this.currentUser.id),
        (user) => {
          this.challenge(user.id);
        }
      );
    });
  }

  challenge(opponentId) {
    Utilities.showCancelPopup(TEXT.WAIT_FOR_ACCEPTANCE, () => {
      this.cancelRequest(opponentId);
    });

    this.socket.emit(MESSAGE.US_CHALLENGE, opponentId);
  }

  cancelRequest(opponentId) {
    this.socket.emit(MESSAGE.US_CHALLENGE_CANCEL, opponentId);
  }

  handleUpdateUserList() {
    this.socket.on(MESSAGE.US_UPDATE_USER_LIST, (availUsers) => {
      this.users = availUsers;
      Utilities.renderAvailableUsers(
        this.users.filter(user => user.id !== this.currentUser.id),
        (user) => {
          this.challenge(user.id);
        }
      );
    });
  }

  requestUserList() {
    this.socket.emit(MESSAGE.US_GET_USER_LIST);
  }

  handleChallengeRequest() {
    this.socket.on(MESSAGE.US_CHALLENGE, (challenger) => {
      Utilities.showQuestionPopup(
        `${challenger.username} is challenging you to a game`,
        'Accept', 'Reject',
        () => {
          this.socket.emit(MESSAGE.US_CHALLENGE_RESPONSE, challenger.id, true);
          this.opponentUser = challenger;
          this.stopListeningOnState(STATE.USER_SELECT);
          Utilities.hideAvailableUsers();
          this.game.setState(STATE.GAME_SETUP);
        },
        () => {
          this.socket.emit(MESSAGE.US_CHALLENGE_RESPONSE, challenger.id, false);
        }
      );
    });
  }

  handleChallengeReponse() {
    this.socket.on(MESSAGE.US_CHALLENGE_RESPONSE, (answer, opponent) => {
      Utilities.removeActivePopup();
      
      if (answer) {
        // GAME ON
        this.opponentUser = opponent;
        Utilities.hideAvailableUsers();
        this.stopListeningOnState(STATE.USER_SELECT);
        this.game.setState(STATE.GAME_SETUP);
      } else {
        Utilities.showOkayPopup(`${opponent.username} has rejected your challenge`);
      }
    });
  }

  handleChallengeCancel() {
    this.socket.on(MESSAGE.US_CHALLENGE_CANCEL, (challenger) => {
      Utilities.removeActivePopup();
      Utilities.showOkayPopup(`${challenger.username} has canceled the challenge`);
    });
  }

  handleChallengingDisconnected() {
    this.socket.on(MESSAGE.DISCONNECTED, (challenger) => {
      Utilities.removeActivePopup();
      Utilities.showOkayPopup(`${challenger.username} is offline!`);
    });
  }

  // ----------------------------------------------------------------------------------
  // STATE IN GAME SETUP
  // ----------------------------------------------------------------------------------
  setupStateInGameSetup() {
    this.handleOpponentDisconnected();
    this.handleOpponentDoneSetup();
  }

  doneSetup() {
    this.game.setPlayer('user', { doneSetup: true });
    this.socket.emit(MESSAGE.GS_DONE_SETUP);
    if (this.game.gameConfig.player.opponent.doneSetup) {
      this.game.setState(STATE.IN_GAME);
    } else {
      Utilities.showMessagePopup(TEXT.SETUP_WAIT_FOR_OPPONENT);
    }
  }

  handleOpponentDoneSetup() {
    this.socket.on(MESSAGE.GS_DONE_SETUP, () => {
      this.game.setPlayer('opponent', { doneSetup: true });
      if (this.game.gameConfig.player.user.doneSetup) {
        this.game.setState(STATE.IN_GAME);
      }
    });
  }

  handleOpponentDisconnected() {
    this.socket.on(MESSAGE.DISCONNECTED, (opponent) => {
      this.stopListeningOnState(STATE.GAME_SETUP);
      Utilities.removeActivePopup();
      Utilities.showOkayPopup(`${opponent.username} is offline!`, () => {
        document.getElementById('in-game').classList.add('hidden');
        this.game.setState(STATE.USER_SELECT);
      });
    });
  }

}