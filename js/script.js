import { MESSAGE } from './Config/config.js';
import Utilities from './Utilities/utilities.js';

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



// Socket IO test
var nickname = 'JamNguyen';
var socket = io(`http://localhost:3000?username=${nickname}`);

socket.on(MESSAGE.UPDATE_USER_LIST, (users) => {
  console.log(users);
});

const onSend = () => {
  socket.emit('client message', new Date().toTimeString());
  return false;
}

document.getElementById('send-btn').addEventListener(
  'click',
  onSend
);