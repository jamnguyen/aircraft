import { MESSAGE, SERVER, STATE } from './Config/config.js';
import Utilities from './Utilities/utilities.js';
import GameManager from './game-manager.js';

// --------------------------------------------------
// SETUP
// --------------------------------------------------
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');



// --------------------------------------------------
// ENTRY POINT
// --------------------------------------------------
Utilities.handleResizeWindow(canvas);
window.addEventListener(
  'resize',
  () => Utilities.handleResizeWindow(canvas)
);

var game = new GameManager(context);
game.start();
