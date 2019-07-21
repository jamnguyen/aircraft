import { SERVER, MESSAGE } from '../Config/config.js';

export default class Utilities {

  static ranged(value, min, max) {
    if (value < min) {
      return min;
    } else if (value > max) {
      return max;
    }
    return value;
  }

  static renderAvailableUsers(users, challengeCallback) {
    let userListDiv = document.getElementById('user-list');
    userListDiv.innerHTML = '';
    for (let user of users) {
      const row = document.createElement('div');
      row.classList.add('user-list-row');
      row.innerHTML = `
        <div class="user-list-row-left">
          ${user.username}
        </div>
        <div class="user-list-row-right">
          <button class="button" type="button">Challenge</button>
        </div>
      `;
      row.getElementsByTagName('button')[0].addEventListener(
        'click',
        () => {
          challengeCallback(user);
        }
      );
      userListDiv.appendChild(row);
    }
  }


  // --------------------------------------------------------------------
  // IN GAME FUNCTIONS
  // --------------------------------------------------------------------
  


}