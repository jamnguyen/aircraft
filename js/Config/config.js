export const MESSAGE = {
  // STATE USER SELECT
  US_LOGIN: 'LOGIN',
  US_CHALLENGE: 'US_CHALLENGE',
  US_CHALLENGE_CANCEL: 'US_CHALLENGE_CANCEL',
  US_CHALLENGE_RESPONSE: 'US_CHALLENGE_RESPONSE',
  US_UPDATE_USER_LIST: 'US_UPDATE_USER_LIST',

  // STATE IN GAME
  IG_ATTACK: 'IG_ATTACK',
  IG_UNDER_ATTACK: 'IG_UNDER_ATTACK',
}

export const SERVER = {
  URL: 'http://localhost:3000'
}

export const STATE = {
  LOGIN: 'LOGIN',
  USER_SELECT: 'USER_SELECT',
  IN_GAME: 'IN_GAME',
  IN_GAME_SETUP: 'IN_GAME_SETUP',
}

// UI CONFIG
export const UI_BOARD = {
  CELL_SIZE: 60,
  BOARD_SIZE: 12,
  STROKE_WIDTH: 1,
  STROKE_COLOR: '#000',
  INDICATOR_FONT: '20px Trebuchet MS',

  PLANE_DEFAULT_X: 5,
  PLANE_DEFAULT_Y: 5,
  PLANE_AMOUNT: 3,
  PLANE_COLOR: 'white',
  PLANE_BORDER_COLOR: 'white',
  PLANE_DEAD_COLOR: 'rgb(100, 100, 100, 1)',
  PLANE_DEAD_BORDER_COLOR: 'rgb(100, 100, 100, 1)',
  PLANE_STROKE_WIDTH: 4,
  PLANE_PADDING: 8,

  BULLET_STROKE_WIDTH: 2,
  BULLET_BOARD_COLOR: 'gray',
  BULLET_BOARD_STROKE_COLOR: 'black',
  BULLET_BODY_COLOR: 'white',
  BULLET_BODY_STROKE_COLOR: 'black',
  BULLET_HEAD_COLOR: 'red',
  BULLET_HEAD_STROKE_COLOR: 'white'
}

export const DIRECTION = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3,
}

export const POSITION_TYPE = {
  BOARD: 'BOARD',
  BODY: 'BODY',
  HEAD: 'HEAD'
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