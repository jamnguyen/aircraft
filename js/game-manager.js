import { MESSAGE, SERVER, STATE, UI_BOARD, DIRECTION, CONFIG, KEY_EVENT } from './Config/config.js';
import MySocket from './socket.js';
import Utilities from './Utilities/utilities.js';
import Board from './board.js';

export default class GameManager {
  socket;
  ctx;
  state;
  stateHandler;   // Type Subject
  gameConfig;
  currentPlane;
  boardPlayer;
  boardPlayerDiv;
  boardOpponent;
  boardOpponentDiv;

  constructor() {
    this.gameConfig = {
      player: {
        user: {
          username: 'Player 1'
        },
        opponent: {
          username: 'Player 2'
        }
      },
      defaultPlane: {
        headX: UI_BOARD.PLANE_DEFAULT_X,
        headY: UI_BOARD.PLANE_DEFAULT_Y,
        direction: DIRECTION.UP,
        color: '',
        dead: false,
        overlapped: false
      },
      planeColors: [
        {
          r: 0,
          g: 255,
          b: 255,
        },
        {
          r: 0,
          g: 255,
          b: 0,
        },
        {
          r: 255,
          g: 0,
          b: 255,
        }
      ],
      colorDelta: 50,
    };
    this.currentPlane = 0;
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

  // --------------------------------------------------------------------
  // STATE LOGIN
  // --------------------------------------------------------------------
  
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

  // --------------------------------------------------------------------
  // STATE USER SELECT
  // --------------------------------------------------------------------

  handleStateUserSelect() {
    this.socket.setupStateUserSelect();
  }

  // --------------------------------------------------------------------
  // STATE IN GAME SETUP
  // --------------------------------------------------------------------

  handleStateInGameSetup() {
    // this.gameConfig.player = {
    //   user: this.socket.currentUser,
    //   opponent: this.socket.opponentUser
    // }
    document.getElementById('in-game').classList.remove('hidden');
    document.getElementById('board-opponent').classList.add('hidden');
    this.boardPlayerDiv = document.getElementById('board-player');
    this.boardPlayerDiv.getElementsByClassName('board-info-name')[0].innerHTML = this.gameConfig.player.user.username;
    this.boardPlayerDiv.getElementsByClassName('board-info-notify')[0].innerHTML = 'Use arrow to move, space to rotate, enter to go next';

    let canvas = document.getElementById('canvas-player');
    canvas.height = UI_BOARD.BOARD_SIZE * UI_BOARD.CELL_SIZE;
    canvas.width = UI_BOARD.BOARD_SIZE * UI_BOARD.CELL_SIZE;
    
    this.boardPlayer = new Board(canvas);
    this.boardPlayer.planes.push({ ...this.gameConfig.defaultPlane });
    const colors = this.gameConfig.planeColors;
    const delta = this.gameConfig.colorDelta;
    let colorStop = 0;
    let colorStopDirection = -1;
  
    let lastFrame = Math.floor(performance.now());

    const frameDraw = () => {
      // Calculate color
      let now = Math.floor(performance.now());
      if (now - lastFrame >= CONFIG.TIME_OF_FRAME) {
        if ((colorStop > 0 && colorStopDirection > 0) || (colorStop < -delta && colorStopDirection < 0)) {
          colorStopDirection = -colorStopDirection;
        }
        colorStop += colorStopDirection;

        this.currentPlane = this.currentPlane;
        let r = Utilities.ranged(colors[this.currentPlane].r + colorStop, 0, 255);
        let g = Utilities.ranged(colors[this.currentPlane].g + colorStop, 0, 255);
        let b = Utilities.ranged(colors[this.currentPlane].b + colorStop, 0, 255);
        this.boardPlayer.setPlaneInfo(this.currentPlane, { color: `rgb(${r}, ${g}, ${b})` });
        lastFrame = now;
      }

      this.boardPlayer.draw();
      window.requestAnimationFrame(frameDraw);
    }

    this.handleKeyEventInGameSetup();
    window.requestAnimationFrame(frameDraw);

    console.log('gameConfig', this.gameConfig);
  }

  handleKeyEventInGameSetup() {
    window.addEventListener('keyup', (e) => {
      this.boardPlayerDiv.getElementsByClassName('board-info-notify')[0].classList.remove('highlight-red');
      this.boardPlayerDiv.getElementsByClassName('board-info-notify')[0].innerHTML = 'Use arrow to move, space to rotate, enter to go next';
      let dx = 0, dy = 0;
      let { direction } = this.boardPlayer.planes[this.currentPlane];
      if (e.keyCode === KEY_EVENT.UP) {
        dy = -1;
      } else if (e.keyCode === KEY_EVENT.DOWN) {
        dy = 1;
      } else if (e.keyCode === KEY_EVENT.LEFT) {
        dx = -1;
      } else if (e.keyCode === KEY_EVENT.RIGHT) {
        dx = 1;
      } else if (e.keyCode === KEY_EVENT.SPACE) {
        direction = ++direction % 4;
      } else if (e.keyCode === KEY_EVENT.ENTER) {
        // Check out of board
        if (this.boardPlayer.isOutside(
          this.boardPlayer.planes[this.currentPlane].headX,
          this.boardPlayer.planes[this.currentPlane].headY,
          direction
        )) {
          this.boardPlayerDiv.getElementsByClassName('board-info-notify')[0].classList.add('highlight-red');
          this.boardPlayerDiv.getElementsByClassName('board-info-notify')[0].innerHTML = 'Hey! Place the plane inside the board!';
          return;
        }

        // Check overlapping
        if (this.boardPlayer.hasOverlapped()) {
          this.boardPlayerDiv.getElementsByClassName('board-info-notify')[0].classList.add('highlight-red');
          this.boardPlayerDiv.getElementsByClassName('board-info-notify')[0].innerHTML = `Don't overlap the planes!`;
          return;
        }


        const {r, g, b} = this.gameConfig.planeColors[this.currentPlane];
        this.boardPlayer.setPlaneInfo(this.currentPlane, { color: `rgb(${r}, ${g}, ${b})` });
        if (this.currentPlane < UI_BOARD.PLANE_AMOUNT - 1) {
          this.currentPlane++;
          this.boardPlayer.planes.push({ ...this.gameConfig.defaultPlane });
          direction = this.gameConfig.defaultPlane.direction;
        } else {
          // WAIT FOR OPPONENT THEN GO TO GAME
        }
      } else if (e.keyCode === KEY_EVENT.ESCAPE) {
        if (this.currentPlane > 0) {
          this.currentPlane--;
          this.boardPlayer.planes.pop();
          direction = this.boardPlayer.planes[this.currentPlane].direction;
        }
      }

      this.boardPlayer.setPlaneInfo(
        this.currentPlane,
        {
          headX: this.boardPlayer.planes[this.currentPlane].headX + dx,
          headY: this.boardPlayer.planes[this.currentPlane].headY + dy,
          direction
        }
      );
    });
  }
}