import { MESSAGE } from './Config/config.js';
import Utilities from './Utilities/utilities.js';

// --------------------------------------------------
// SETUP
// --------------------------------------------------
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
let currentUser = {
  username: 'User'
};



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
    currentUser.username = document.getElementById('name-input').value;
    if (!currentUser.username) {
      return;
    }
    registerForm.style.display = 'none';
    Utilities.setupSocket(currentUser.username);
  }
);