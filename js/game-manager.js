import { MESSAGE, SERVER, STATE, UI_BOARD, DIRECTION, CONFIG, KEY_EVENT, TEXT, BULLET_TYPE } from './Config/config.js';
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
  turn;
  drawFrameId;
  keyEventCallback;

  constructor() {
    this.reset();
  }

  reset() {
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
    document.getElementById('in-game').classList.add('hidden');
    if (this.boardPlayer) {
      this.boardPlayer.reset();
    }
    if (this.boardOpponent) {
      this.boardOpponent.reset();
    }
    if (this.keyEventCallback) {
      window.removeEventListener('keyup', this.keyEventCallback);
      this.keyEventCallback = null;
    }
    if (this.drawFrameId) {
      window.cancelAnimationFrame(this.drawFrameId);
      this.drawFrameId = null;
    }
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
      } else if (state === STATE.GAME_SETUP) {
        this.handleStateGameSetup();
      } else if (state === STATE.IN_GAME) {
        this.handleStateInGame();
      }
    });

    this.stateHandler.next(STATE.LOGIN);
  }

  setState(state) {
    this.stateHandler.next(state);
  }

  setPlayer(player, value) {
    this.gameConfig.player[player] = {
      ...this.gameConfig.player[player],
      ...value
    };
  }

  setTurn(player) {
    this.turn = player;
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
        this.setState(STATE.USER_SELECT);
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
  // STATE GAME SETUP
  // --------------------------------------------------------------------

  handleStateGameSetup() {
    this.gameConfig.player = {
      user: {
        ...this.socket.currentUser,
        doneSetup: false
      },
      opponent: {
        ...this.socket.opponentUser,
        doneSetup: false
      }
    }
    console.log('gameConfig', this.gameConfig);
    
    this.handleUIGameSetup();
    this.handleKeyEventGameSetup();
    this.socket.setupStateGameSetup();
  }

  handleUIGameSetup() {
    document.getElementById('in-game').classList.remove('hidden');
    document.getElementById('board-opponent').classList.add('hidden');
    this.boardPlayerDiv = document.getElementById('board-player');
    this.boardPlayerDiv.getElementsByClassName('board-info-name')[0].innerHTML = TEXT.SETUP_TITLE;
    this.boardPlayerDiv.getElementsByClassName('board-info-notify')[0].innerHTML = TEXT.SETUP_DIRECTION;

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
      this.drawFrameId = window.requestAnimationFrame(frameDraw);
    }
    this.drawFrameId = window.requestAnimationFrame(frameDraw);
  }

  handleKeyEventGameSetup() {
    if (this.keyEventCallback) {
      window.removeEventListener('keyup', this.keyEventCallback);
    }

    this.keyEventCallback = (e) => {
      this.boardPlayerDiv.getElementsByClassName('board-info-notify')[0].classList.remove('highlight-red');
      this.boardPlayerDiv.getElementsByClassName('board-info-notify')[0].innerHTML = TEXT.SETUP_DIRECTION;
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
          this.boardPlayerDiv.getElementsByClassName('board-info-notify')[0].innerHTML = TEXT.SETUP_OUTSIDE_BOARD;
          return;
        }

        // Check overlapping
        if (this.boardPlayer.hasOverlapped()) {
          this.boardPlayerDiv.getElementsByClassName('board-info-notify')[0].classList.add('highlight-red');
          this.boardPlayerDiv.getElementsByClassName('board-info-notify')[0].innerHTML = TEXT.SETUP_OVERLAP;
          return;
        }


        const {r, g, b} = this.gameConfig.planeColors[this.currentPlane];
        this.boardPlayer.setPlaneInfo(this.currentPlane, { color: `rgb(${r}, ${g}, ${b})` });
        if (this.currentPlane < UI_BOARD.PLANE_AMOUNT - 1) {
          this.currentPlane++;
          this.boardPlayer.planes.push({ ...this.gameConfig.defaultPlane });
          direction = this.gameConfig.defaultPlane.direction;
        } else {
          this.socket.doneSetup();
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
    };

    window.addEventListener('keyup', this.keyEventCallback);
  }

  // --------------------------------------------------------------------
  // STATE IN GAME
  // --------------------------------------------------------------------

  handleStateInGame() {    
    this.handleUIInGame();
    this.handleKeyEventInGame();
    this.socket.setupStateInGame();
  }

  handleUIInGame() {
    Utilities.removeActivePopup();

    this.setPlayer('user', { lives: UI_BOARD.PLANE_AMOUNT });
    this.setPlayer('opponent', { lives: UI_BOARD.PLANE_AMOUNT });
    const { player } = this.gameConfig;

    // Reset player board
    window.cancelAnimationFrame(this.drawFrameId);
    const tempBoard = this.boardPlayerDiv.cloneNode(true);
    this.boardPlayerDiv.remove();
    this.boardPlayerDiv = tempBoard;
    this.boardOpponentDiv = document.getElementById('board-opponent');
    document.getElementById('in-game').insertBefore(this.boardPlayerDiv, this.boardOpponentDiv);
    this.boardPlayerDiv.getElementsByClassName('board-info-name')[0].innerHTML = player.user.username;
    this.boardPlayerDiv.getElementsByClassName('board-info-notify')[0].innerHTML = `Lives: <span id="user-lives" class="highlight-red">${player.user.lives}</span>`;
    let canvas = document.getElementById('canvas-player');
    this.boardPlayer.setCanvas(canvas);

    this.boardOpponentDiv.classList.remove('hidden');
    this.boardOpponentDiv = document.getElementById('board-opponent');
    this.boardOpponentDiv.getElementsByClassName('board-info-name')[0].innerHTML = player.opponent.username;
    this.boardOpponentDiv.getElementsByClassName('board-info-notify')[0].innerHTML = `Lives: <span id="opponent-lives" class="highlight-red">${player.opponent.lives}</span>`;

    canvas = document.getElementById('canvas-opponent');
    canvas.height = UI_BOARD.BOARD_SIZE * UI_BOARD.CELL_SIZE;
    canvas.width = UI_BOARD.BOARD_SIZE * UI_BOARD.CELL_SIZE;
    
    this.boardOpponent = new Board(canvas);

    const delta = UI_BOARD.AIMING_MARK_MAX_OFFSET;
    let stop = 0;
    let stopDirection = -1;
  
    let lastFrame = Math.floor(performance.now());

    const frameDraw = () => {
      // Calculate color
      let now = Math.floor(performance.now());
      if (now - lastFrame >= CONFIG.TIME_OF_FRAME * 3) {
        if ((stop >= delta && stopDirection > 0) || (stop <= 0 && stopDirection < 0)) {
          stopDirection = -stopDirection;
        }
        stop += stopDirection;
        this.boardOpponent.setIndicator({ offset: stop });
        lastFrame = now;
      }

      this.boardPlayer.draw();
      this.boardOpponent.showAimingMark = this.turn === 'user';
      this.boardOpponent.draw();
      this.drawFrameId = window.requestAnimationFrame(frameDraw);
    }
    this.drawFrameId = window.requestAnimationFrame(frameDraw);
  }

  handleKeyEventInGame() {
    if (this.keyEventCallback) {
      window.removeEventListener('keyup', this.keyEventCallback);
    }

    this.keyEventCallback = (e) => {
      if (this.turn === 'opponent') {
        return;
      }
      let dx = 0, dy = 0;
      if (e.keyCode === KEY_EVENT.UP) {
        dy = -1;
      } else if (e.keyCode === KEY_EVENT.DOWN) {
        dy = 1;
      } else if (e.keyCode === KEY_EVENT.LEFT) {
        dx = -1;
      } else if (e.keyCode === KEY_EVENT.RIGHT) {
        dx = 1;
      } else if (e.keyCode === KEY_EVENT.ENTER) {
        // ATTACK
        if (this.boardOpponent.hasBullet(this.boardOpponent.indicator.x, this.boardOpponent.indicator.y)) {
          return;
        }
        // Send coordinate to opponent
        this.socket.attack({ x: this.boardOpponent.indicator.x, y: this.boardOpponent.indicator.y, type: null});
        this.setTurn('opponent');
      }

      if (
        this.boardOpponent.indicator.x + dx < 1 || this.boardOpponent.indicator.x + dx > UI_BOARD.BOARD_SIZE - 2 ||
        this.boardOpponent.indicator.y + dy < 1 || this.boardOpponent.indicator.y + dy > UI_BOARD.BOARD_SIZE - 2
      ) {
        return;
      }

      this.boardOpponent.setIndicator({
        x: this.boardOpponent.indicator.x + dx,
        y: this.boardOpponent.indicator.y + dy,
      });
    };

    window.addEventListener('keyup', this.keyEventCallback);
  }

  updateLives(player) {
    const board = player === 'user' ? this.boardPlayer : this.boardOpponent;
    const lives = UI_BOARD.PLANE_AMOUNT - board.getHeadBulletAmount();
    this.setPlayer(player, { lives });
    document.getElementById(`${player}-lives`).innerHTML = this.gameConfig.player[player].lives;
  }

  getBulletType(x, y) {
    return this.boardPlayer.getBulletType(x, y);
  }

  addBullet(player, bullet) {
    const board = player === 'user' ? this.boardPlayer : this.boardOpponent;
    board.bullets.push(bullet);
    if (player === 'user' && bullet.type === BULLET_TYPE.HEAD) {
      board.planes.find(plane => plane.headX === bullet.x && plane.headY === bullet.y).dead = true;
    }
  }
  
  getDeadPlaneAmount(player) {
    const board = player === 'user' ? this.boardPlayer : this.boardOpponent;
    return board.getDeadPlaneAmount();
  }

  getHeadBulletAmount(player) {
    const board = player === 'user' ? this.boardPlayer : this.boardOpponent;
    return board.getHeadBulletAmount();
  }
}