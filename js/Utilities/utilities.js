import { SERVER, MESSAGE } from '../Config/config.js';

export default class Utilities {
  static activePopup = null;

  static ranged(value, min, max) {
    if (value < min) {
      return min;
    } else if (value > max) {
      return max;
    }
    return value;
  }

  static renderAvailableUsers(users, challengeCallback) {
    document.getElementById('available-users').classList.remove('hidden');

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

  static hideAvailableUsers() {
    document.getElementById('available-users').classList.add('hidden');
  }


  // --------------------------------------------------------------------
  // IN GAME FUNCTIONS
  // --------------------------------------------------------------------


  // --------------------------------------------------------------------
  // UI SUPPORT
  // --------------------------------------------------------------------
  static showCancelPopup(message, btnCallback) {
    let body = document.getElementsByTagName('body')[0];

    let popupBackground = document.createElement('div');
    popupBackground.classList.add('popup-background');

    let messagePopup = document.createElement('div');
    messagePopup.classList.add('popup', 'popup-message');

    let messageP = document.createElement('p');
    messageP.classList.add('message');
    messageP.innerHTML = message;
    
    let btn = document.createElement('button');
    btn.type = 'button';
    btn.classList.add('button', 'button-red');
    btn.innerHTML = 'Cancel';

    messagePopup.append(messageP, btn);
    popupBackground.appendChild(messagePopup);
    body.appendChild(popupBackground);

    btn.addEventListener('click', () => {
      popupBackground.remove();
    });

    if (btnCallback) {
      btn.addEventListener('click', btnCallback);
    }

    this.activePopup = popupBackground;
  }

  static showOkayPopup(message, btnCallback) {
    let body = document.getElementsByTagName('body')[0];

    let popupBackground = document.createElement('div');
    popupBackground.classList.add('popup-background');

    let messagePopup = document.createElement('div');
    messagePopup.classList.add('popup', 'popup-message');

    let messageP = document.createElement('p');
    messageP.classList.add('message');
    messageP.innerHTML = message;
    
    let btn = document.createElement('button');
    btn.type = 'button';
    btn.classList.add('button');
    btn.innerHTML = 'Okay';

    messagePopup.append(messageP, btn);
    popupBackground.appendChild(messagePopup);
    body.appendChild(popupBackground);

    btn.addEventListener('click', () => {
      popupBackground.remove();
    });

    if (btnCallback) {
      btn.addEventListener('click', btnCallback);
    }

    this.activePopup = popupBackground;
  }

  static showQuestionPopup(message, yesBtnTitle, noBtnTitle, yesCallback, noCallback) {
    let body = document.getElementsByTagName('body')[0];

    let popupBackground = document.createElement('div');
    popupBackground.classList.add('popup-background');

    let messagePopup = document.createElement('div');
    messagePopup.classList.add('popup', 'popup-message');
    
    let messageP = document.createElement('p');
    messageP.classList.add('message');
    messageP.innerHTML = message;
    
    let btnGroup = document.createElement('div');
    btnGroup.classList.add('button-group');

    let yesBtn = document.createElement('button');
    yesBtn.type = 'button';
    yesBtn.classList.add('button', 'm-r-md');
    yesBtn.innerHTML = yesBtnTitle || 'Yes';

    let noBtn = document.createElement('button');
    noBtn.type = 'button';
    noBtn.classList.add('button', 'button-red');
    noBtn.innerHTML = noBtnTitle || 'No';

    btnGroup.append(yesBtn, noBtn);
    messagePopup.append(messageP, btnGroup);
    popupBackground.appendChild(messagePopup);
    body.appendChild(popupBackground);

    yesBtn.addEventListener('click', () => {
      popupBackground.remove();
    });

    noBtn.addEventListener('click', () => {
      popupBackground.remove();
    });

    if (yesCallback) {
      yesBtn.addEventListener('click', yesCallback);
    }

    if (noCallback) {
      noBtn.addEventListener('click', noCallback);
    }

    this.activePopup = popupBackground;
  }
  
  static removeActivePopup() {
    if (this.activePopup) {
      this.activePopup.remove();
    }
  }



}