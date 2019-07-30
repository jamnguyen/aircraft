import { MESSAGE, UI_BOARD, SERVER, STATE, TEXT, BULLET_TYPE } from './Config/config.js';
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

  stopAllListener() {
    this.socket.removeAllListeners(MESSAGE.DISCONNECTED);

    this.socket.removeAllListeners(MESSAGE.US_LOGIN);
    this.socket.removeAllListeners(MESSAGE.US_UPDATE_USER_LIST);
    this.socket.removeAllListeners(MESSAGE.US_CHALLENGE);
    this.socket.removeAllListeners(MESSAGE.US_CHALLENGE_CANCEL);
    this.socket.removeAllListeners(MESSAGE.US_CHALLENGE_RESPONSE);

    this.socket.removeAllListeners(MESSAGE.IG_ATTACK);
    this.socket.removeAllListeners(MESSAGE.IG_ATTACK_RESPONSE);
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
    Utilities.removeActivePopup();
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
      Utilities.removeActivePopup();
      Utilities.showQuestionPopup(
        `${challenger.username} is challenging you to a game`,
        'Accept', 'Reject',
        () => {
          this.socket.emit(MESSAGE.US_CHALLENGE_RESPONSE, challenger.id, true);
          this.opponentUser = challenger;
          this.stopAllListener();
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
        this.stopAllListener();
        this.game.setState(STATE.GAME_SETUP);
      } else {
        Utilities.removeActivePopup();
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
  // STATE GAME SETUP
  // ----------------------------------------------------------------------------------
  setupStateGameSetup() {
    this.handleOpponentDisconnectedSetup();
    this.handleOpponentDoneSetup();
  }

  doneSetup() {
    this.game.setPlayer('user', { doneSetup: true });
    this.socket.emit(MESSAGE.GS_DONE_SETUP);
    if (this.game.gameConfig.player.opponent.doneSetup) {
      this.game.setTurn('opponent');
      this.stopAllListener();
      this.game.setState(STATE.IN_GAME);
    } else {
      this.game.setTurn('user');
      Utilities.removeActivePopup();
      Utilities.showMessagePopup(TEXT.SETUP_WAIT_FOR_OPPONENT);
    }
  }

  handleOpponentDoneSetup() {
    this.socket.on(MESSAGE.GS_DONE_SETUP, () => {
      this.game.setPlayer('opponent', { doneSetup: true });
      if (this.game.gameConfig.player.user.doneSetup) {
        this.stopAllListener();
        this.game.setState(STATE.IN_GAME);
      }
    });
  }

  handleOpponentDisconnectedSetup() {
    this.socket.on(MESSAGE.DISCONNECTED, (opponent) => {
      this.stopAllListener();
      Utilities.removeActivePopup();
      Utilities.showOkayPopup(`${opponent.username} is offline!`, () => {
        document.getElementById('in-game').classList.add('hidden');
        this.game.setState(STATE.USER_SELECT);
      });
    });
  }

  // ----------------------------------------------------------------------------------
  // STATE IN GAME
  // ----------------------------------------------------------------------------------
  setupStateInGame() {
    this.handleUnderAttack();
    this.handleAttackResponse();
    this.handleOpponentDisconnectedInGame();
  }

  attack(bullet) {
    this.socket.emit(MESSAGE.IG_ATTACK, bullet);
  }

  endGame() {
    this.socket.emit(MESSAGE.IG_ENDGAME);
  }

  handleUnderAttack() {
    this.socket.on(MESSAGE.IG_ATTACK, (bullet) => {
      bullet.type = this.game.getBulletType(bullet.x, bullet.y);
      this.socket.emit(MESSAGE.IG_ATTACK_RESPONSE, bullet);
      this.game.addBullet('user', bullet);
      if (bullet.type === BULLET_TYPE.HEAD) {
        this.game.updateLives('user');
      }
      if (this.game.getHeadBulletAmount('user') >= UI_BOARD.PLANE_AMOUNT) {
        Utilities.removeActivePopup();
        Utilities.showOkayPopup(TEXT.IG_LOSE, () => {
          this.stopAllListener();
          this.game.reset();
          this.endGame();
          this.game.setState(STATE.USER_SELECT);
        });
      }
      this.game.setTurn('user');
    });
  }
  
  handleAttackResponse() {
    this.socket.on(MESSAGE.IG_ATTACK_RESPONSE, bullet => {
      this.game.addBullet('opponent', bullet);
      if (bullet.type === BULLET_TYPE.HEAD) {
        this.game.updateLives('opponent');
      }
      if (this.game.getHeadBulletAmount('opponent') >= UI_BOARD.PLANE_AMOUNT) {
        Utilities.removeActivePopup();
        Utilities.showOkayPopup(TEXT.IG_WIN, () => {
          this.stopAllListener();
          this.game.reset();
          this.endGame();
          this.game.setState(STATE.USER_SELECT);
        });
      }
    });
  }

  handleOpponentDisconnectedInGame() {
    this.socket.on(MESSAGE.DISCONNECTED, (opponent) => {
      this.stopAllListener();
      Utilities.removeActivePopup();
      Utilities.showOkayPopup(`${opponent.username} is offline!`, () => {
        document.getElementById('in-game').classList.add('hidden');
        this.game.reset();
        this.endGame();
        this.game.setState(STATE.USER_SELECT);
      });
    });
  }

}