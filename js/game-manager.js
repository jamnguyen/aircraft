import { MESSAGE, SERVER, STATE } from './Config/config.js';
import MySocket from './socket.js';

export default class GameManager {
  socket;
  ctx;
  state;
  stateHandler;   // Type Subject
  gameConfig;

  constructor(context) {
    this.ctx = context;
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
      } else if (state === STATE.IN_GAME) {
        this.handleStateInGame();
      }
    });

    this.stateHandler.next(STATE.LOGIN);
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

  handleStateInGame() {
    this.gameConfig = {
      user: this.socket.currentUser,
      opponent: this.socket.opponentUser
    }
    console.log('gameConfig', this.gameConfig);
  }
}