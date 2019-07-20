import { MESSAGE, SERVER, STATE } from './Config/config.js';
import Utilities from './Utilities/utilities.js';
import GameManager from './game-manager.js';

// --------------------------------------------------
// SETUP
// --------------------------------------------------
// const canvas = document.getElementById('canvas');
// const context = canvas.getContext('2d');



// --------------------------------------------------
// ENTRY POINT
// --------------------------------------------------

// window.addEventListener(
//   'resize',
//   () => Utilities.handleResizeWindow(canvas)
// );

var game = new GameManager();
game.start();
