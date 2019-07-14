import { MESSAGE, SERVER, STATE } from './Config/config.js';
import Utilities from './Utilities/utilities.js';
import MySocket from './socket.js';

// --------------------------------------------------
// SETUP
// --------------------------------------------------
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
var socket;



// --------------------------------------------------
// ENTRY POINT
// --------------------------------------------------
Utilities.handleResizeWindow(canvas);
window.addEventListener(
  'resize',
  () => Utilities.handleResizeWindow(canvas)
);
// Setup user
var registerForm = document.getElementById('register-form');
registerForm.addEventListener(
  'submit',
  (e) => {
    e.preventDefault();
    const username = document.getElementById('name-input').value;
    if (!username) {
      return;
    }
    registerForm.style.display = 'none';

    // SET UP SOCKET
    socket = new MySocket(username);
    
    
  }
);
