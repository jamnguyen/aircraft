export const MESSAGE = {
  DISCONNECTED: 'DISCONNECTED',

  // STATE USER SELECT
  US_LOGIN: 'LOGIN',
  US_CHALLENGE: 'US_CHALLENGE',
  US_CHALLENGE_CANCEL: 'US_CHALLENGE_CANCEL',
  US_CHALLENGE_RESPONSE: 'US_CHALLENGE_RESPONSE',
  US_UPDATE_USER_LIST: 'US_UPDATE_USER_LIST',
  US_GET_USER_LIST: 'US_GET_USER_LIST',

  // STATE GAME SETUP
  GS_DONE_SETUP: 'GS_DONE_SETUP',

  // STATE IN GAME
  IG_ATTACK: 'IG_ATTACK',
  IG_ATTACK_RESPONSE: 'IG_ATTACK_RESPONSE',
  IG_RESIGN: 'IG_RESIGN',
  IG_PLANES: 'IG_PLANES',
  IG_ENDGAME: 'IG_ENDGAME',
  IG_CHAT: 'IG_CHAT',
}

export const SERVER = {
  // URL: 'http://localhost:8080',
  URL: 'https://aircraft-259909.appspot.com/'
}

export const STATE = {
  LOGIN: 'LOGIN',
  USER_SELECT: 'USER_SELECT',
  IN_GAME: 'IN_GAME',
  GAME_SETUP: 'GAME_SETUP',
}

// UI CONFIG
export const UI_BOARD = {
  CELL_SIZE: 54,
  BOARD_SIZE: 12,
  STROKE_WIDTH: 1,
  STROKE_COLOR: '#000',
  INDICATOR_FONT: '20px Trebuchet MS',

  PLANE_DEFAULT_X: 5,
  PLANE_DEFAULT_Y: 5,
  PLANE_AMOUNT: 3,
  PLANE_COLOR: 'white',
  PLANE_BORDER_COLOR: 'white',
  PLANE_DEAD_COLOR: 'rgb(100, 100, 100)',
  PLANE_DEAD_BORDER_COLOR: 'rgb(100, 100, 100)',
  PLANE_STROKE_WIDTH: 4,
  PLANE_PADDING: 8,

  BULLET_STROKE_WIDTH: 2,
  BULLET_BOARD_COLOR: 'gray',
  BULLET_BOARD_STROKE_COLOR: 'black',
  BULLET_BODY_COLOR: 'white',
  BULLET_BODY_STROKE_COLOR: 'black',
  BULLET_HEAD_COLOR: 'red',
  BULLET_HEAD_STROKE_COLOR: 'white',
  BULLET_HIGHLIGHT_COLOR: 'rgba(255, 242, 50, .5)',

  AIMING_MARK_COLOR: 'rgb(230, 0, 0)',
  AIMING_MARK_WIDTH: 10,
  AIMING_MARK_MAX_OFFSET: 3
}

export const BULLET_TYPE = {
  BOARD: 1,
  BODY: 2,
  HEAD: 3
}

export const TEXT = {
  WAIT_FOR_ACCEPTANCE: `Waiting for opponent's response...`,
  SETUP_TITLE: `Setup your planes`,
  SETUP_DIRECTION: `Move: <span class="highlight-red">Arrow keys</span> | Rotate: <span class="highlight-red">Spacebar</span> | Next: <span class="highlight-red">Enter</span> | Back: <span class="highlight-red">Esc</span>`,
  SETUP_OUTSIDE_BOARD: `Place the plane inside the board!`,
  SETUP_OVERLAP: `Don't overlap the planes!`,
  SETUP_WAIT_FOR_OPPONENT: `Waiting for your opponent...`,
  IG_WIN: `You win!`,
  IG_LOSE: `You lose!`,
}

export const DIRECTION = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3,
}

export const KEY_EVENT = {
  ENTER: 13,
  ESCAPE: 27,
  SPACE: 32,
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39
}

export const CONFIG = {
  FPS: 60,
  TIME_OF_FRAME: 1000 / 60
}

export const PLANE_MATRIX = {
  [DIRECTION.UP]: {
    0: {
      x: -2,
      y: 1
    },
    1: {
      x: -1,
      y: 1
    },
    2: {
      x: 0,
      y: 1
    },
    3: {
      x: 1,
      y: 1
    },
    4: {
      x: 2,
      y: 1
    },
    5: {
      x: 0,
      y: 2
    },
    6: {
      x: -1,
      y: 3
    },
    7: {
      x: 0,
      y: 3
    },
    8: {
      x: 1,
      y: 3
    },
    9: {
      x: 0,
      y: 0
    }
  },
  [DIRECTION.DOWN]: {
    0: {
      x: -2,
      y: -1
    },
    1: {
      x: -1,
      y: -1
    },
    2: {
      x: 0,
      y: -1
    },
    3: {
      x: 1,
      y: -1
    },
    4: {
      x: 2,
      y: -1
    },
    5: {
      x: 0,
      y: -2
    },
    6: {
      x: -1,
      y: -3
    },
    7: {
      x: 0,
      y: -3
    },
    8: {
      x: 1,
      y: -3
    },
    9: {
      x: 0,
      y: 0
    }
  },
  [DIRECTION.LEFT]: {
    0: {
      x: 1,
      y: 2
    },
    1: {
      x: 1,
      y: 1
    },
    2: {
      x: 1,
      y: 0
    },
    3: {
      x: 1,
      y: -1
    },
    4: {
      x: 1,
      y: -2
    },
    5: {
      x: 2,
      y: 0
    },
    6: {
      x: 3,
      y: 1
    },
    7: {
      x: 3,
      y: 0
    },
    8: {
      x: 3,
      y: -1
    },
    9: {
      x: 0,
      y: 0
    }
  },
  [DIRECTION.RIGHT]: {
    0: {
      x: -1,
      y: 2
    },
    1: {
      x: -1,
      y: 1
    },
    2: {
      x: -1,
      y: 0
    },
    3: {
      x: -1,
      y: -1
    },
    4: {
      x: -1,
      y: -2
    },
    5: {
      x: -2,
      y: 0
    },
    6: {
      x: -3,
      y: 1
    },
    7: {
      x: -3,
      y: 0
    },
    8: {
      x: -3,
      y: -1
    },
    9: {
      x: 0,
      y: 0
    }
  }
}