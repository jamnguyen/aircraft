import { MESSAGE, SERVER, STATE, UI_BOARD } from './Config/config.js';
import MySocket from './socket.js';
import Utilities from './Utilities/utilities.js';
import Board from './board.js';

export default class GameManager {
  socket;
  ctx;
  state;
  stateHandler;   // Type Subject
  gameConfig;
  boardPlayer;
  boardOpponent;

  constructor(context) {
  }

  start() {
    const { Subject } = rxjs;
    this.stateHandler = new Subject();

    this.stateHandler.subscribe(state => {
      console.log('state', state);
      if (state === STATE.LOGIN) {
        this.handleStateLogin();
      } else if (state === STATE.USER_SELECT) {
        this.handleStateUserSelect();
      } else if (state === STATE.IN_GAME_SETUP) {
        this.handleStateInGameSetup();
      }
    });

    this.stateHandler.next(STATE.IN_GAME_SETUP);
  }

  setState(state) {
    this.stateHandler.next(state);
  }
  
  handleStateLogin() {  
    let registerForm = document.getElementById('register-form');
    registerForm.classList.remove('hidden');
    registerForm.addEventListener(
      'submit',
      (e) => {
        e.preventDefault();
        const username = document.getElementById('name-input').value;
        if (!username) {
          return;
        }
        this.socket = new MySocket(username, this);
        registerForm.classList.add('hidden');
        this.stateHandler.next(STATE.USER_SELECT);
      }
    );
  }

  handleStateUserSelect() {
    this.socket.setupStateUserSelect();
  }

  handleStateInGameSetup() {
    // this.gameConfig = {
    //   user: this.socket.currentUser,
    //   opponent: this.socket.opponentUser
    // }
    this.gameConfig = {
      user: {
        username: 'Player 1'
      },
      opponent: {
        username: 'Player 2'
      }
    }
    let gameContainer = document.getElementById('in-game');
    gameContainer.classList.remove('hidden');
    let canvas = document.getElementById('canvas-player');
    canvas.height = UI_BOARD.BOARD_SIZE * UI_BOARD.CELL_SIZE;
    canvas.width = UI_BOARD.BOARD_SIZE * UI_BOARD.CELL_SIZE;
    this.boardPlayer = new Board(canvas);
    this.boardPlayer.drawBoard();
    this.boardPlayer.drawPlanes();
    this.boardPlayer.drawBullets();

    console.log('gameConfig', this.gameConfig);
  }
}