import { SERVER, MESSAGE } from '../Config/config.js';

export default class Utilities {

  static handleResizeWindow(canvas) {
    console.log('handleResizeWindow')
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
  }

  static setupSocket(username) {
    var socket = io(`${SERVER.URL}?username=${username}`);

    socket.on(MESSAGE.UPDATE_USER_LIST, (users) => {
      console.log(users);
    });
  }
}