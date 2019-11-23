import GameManager from './game-manager.js';
var game; 
setTimeout(() => {
  document.getElementById('splash').classList.add('hidden-fade');
  game = new GameManager();
  game.start();
}, 3000);

setTimeout(() => {
  document.getElementById('splash').classList.add('hidden');
}, 4010);
