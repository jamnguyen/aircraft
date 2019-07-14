export default class Utilities {

  static handleResizeWindow(canvas) {
    console.log('handleResizeWindow')
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
  }
}