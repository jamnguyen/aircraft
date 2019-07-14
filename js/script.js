import { MESSAGE, SERVER } from './Config/config.js';
import Utilities from './Utilities/utilities.js';

// --------------------------------------------------
// SETUP
// --------------------------------------------------
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
var users;
var currentUser = {
  username: 'User'
};
var socket;
var state = 'INPUT_NAME';



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
var availableUserDiv = document.getElementById('available-user');
registerForm.addEventListener(
  'submit',
  (e) => {
    e.preventDefault();
    currentUser.username = document.getElementById('name-input').value;
    if (!currentUser.username) {
      return;
    }
    registerForm.style.display = 'none';

    // SET UP SOCKET
    state = 'USER_SELECTING';
    socket = io(`${SERVER.URL}?username=${currentUser.username}`);
    
    socket.on(MESSAGE.LOGIN, (res) => {
      currentUser = res.currentUser;
      users = res.users;
      console.log('current', currentUser);
      if (state === 'USER_SELECTING') {
        availableUserDiv.style.display = 'block';
        Utilities.renderAvailableUsers(
          users.filter(user => user.id !== currentUser.id),
          (user) => {
            console.log(user.id);
          }
        );
      }
    });

    socket.on(MESSAGE.UPDATE_USER_LIST, (availUsers) => {
      users = availUsers;
      if (state === 'USER_SELECTING') {
        availableUserDiv.style.display = 'block';
        Utilities.renderAvailableUsers(
          users.filter(user => user.id !== currentUser.id),
          (user) => {
            console.log(user.id);
          }
        );
      }
    });
  }
);
