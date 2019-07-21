import { UI_BOARD, DIRECTION, POSITION_TYPE } from './Config/config.js';

export default class Board {
  canvas;
  ctx;
  planes = [
    // {
    //   headX: 3,
    //   headY: 1,
    //   direction: DIRECTION.UP,
    //   color: 'rgba(0, 255, 255, 1)',
    //   dead: true
    // },
    // {
    //   headX: 5,
    //   headY: 6,
    //   direction: DIRECTION.DOWN,
    //   color: 'rgba(0, 255, 0, 1)',
    //   dead: false
    // },
    // {
    //   headX: 7,
    //   headY: 8,
    //   direction: DIRECTION.LEFT,
    //   color: 'rgba(255, 0, 0, 1)',
    //   dead: false
    // },
  ];
  bullets = [
    // {
    //   x: 3,
    //   y: 3,
    //   type: POSITION_TYPE.BODY
    // },
    // {
    //   x: 5,
    //   y: 5,
    //   type: POSITION_TYPE.BODY
    // },
    // {
    //   x: 8,
    //   y: 8,
    //   type: POSITION_TYPE.BODY
    // },
    // {
    //   x: 7,
    //   y: 3,
    //   type: POSITION_TYPE.BOARD
    // },
    // {
    //   x: 3,
    //   y: 1,
    //   type: POSITION_TYPE.HEAD
    // }
  ]

  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  clean() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawBoard() {
    this.ctx.strokeStyle = UI_BOARD.STROKE_COLOR;
    this.ctx.lineWidth = UI_BOARD.STROKE_WIDTH;

    for (let i = 1; i < UI_BOARD.BOARD_SIZE; i++) {
      // Draw vertical line
      this.ctx.beginPath();
      this.ctx.moveTo(i * UI_BOARD.CELL_SIZE - 1, UI_BOARD.CELL_SIZE - 1);
      this.ctx.lineTo(i * UI_BOARD.CELL_SIZE - 1, this.canvas.height - UI_BOARD.CELL_SIZE - 1);
      this.ctx.stroke();

      // Draw vertical indicator
      this.ctx.font = UI_BOARD.INDICATOR_FONT;
      this.ctx.textBaseline = "middle";
      this.ctx.textAlign = 'center';
      if (i < UI_BOARD.BOARD_SIZE - 1) {
        this.ctx.fillText(i, i * UI_BOARD.CELL_SIZE + (UI_BOARD.CELL_SIZE / 2), UI_BOARD.CELL_SIZE / 2);
      }
      
      // Draw horizontal line
      this.ctx.moveTo(UI_BOARD.CELL_SIZE - 1, i * UI_BOARD.CELL_SIZE - 1);
      this.ctx.lineTo(this.canvas.width - UI_BOARD.CELL_SIZE - 1, i * UI_BOARD.CELL_SIZE - 1);
      this.ctx.stroke();
      this.ctx.closePath();

      // Draw horizontal indicator
      this.ctx.font = UI_BOARD.INDICATOR_FONT;
      if (i < UI_BOARD.BOARD_SIZE - 1) {
        this.ctx.fillText(String.fromCharCode(65 + i - 1), UI_BOARD.CELL_SIZE / 2, i * UI_BOARD.CELL_SIZE + (UI_BOARD.CELL_SIZE / 2));
      }
    }
  }

  drawPlanes() {
    for (let plane of this.planes) {
      this.ctx.save();
      if (plane.direction === DIRECTION.UP) {
        this.ctx.translate(plane.headX * UI_BOARD.CELL_SIZE + UI_BOARD.CELL_SIZE / 2, plane.headY * UI_BOARD.CELL_SIZE + UI_BOARD.CELL_SIZE / 2);
        this.drawPlane(-1, -1, plane);
      } else if (plane.direction === DIRECTION.DOWN) {
        this.ctx.translate(plane.headX * UI_BOARD.CELL_SIZE + UI_BOARD.CELL_SIZE / 2, plane.headY * UI_BOARD.CELL_SIZE + UI_BOARD.CELL_SIZE / 2);
        this.ctx.rotate(180 * Math.PI / 180);
        this.drawPlane(1, 1, plane);
      } else if (plane.direction === DIRECTION.LEFT) {
        this.ctx.translate(plane.headX * UI_BOARD.CELL_SIZE + UI_BOARD.CELL_SIZE / 2, plane.headY * UI_BOARD.CELL_SIZE + UI_BOARD.CELL_SIZE / 2);
        this.ctx.rotate(-90 * Math.PI / 180);
        this.drawPlane(1, -1, plane);
      } else if (plane.direction === DIRECTION.RIGHT) {
        this.ctx.translate(plane.headX * UI_BOARD.CELL_SIZE + UI_BOARD.CELL_SIZE / 2, plane.headY * UI_BOARD.CELL_SIZE + UI_BOARD.CELL_SIZE / 2);
        this.ctx.rotate(90 * Math.PI / 180);
        this.drawPlane(-1, 1, plane);
      }
      this.ctx.restore();
    }
  }

  drawPlane(headX, headY, plane) {
    // Setup size constants
    const cell = UI_BOARD.CELL_SIZE;
    const padding = UI_BOARD.PLANE_PADDING;
    const cellWithPadding = UI_BOARD.CELL_SIZE - 2 * UI_BOARD.PLANE_PADDING;
    const halfCell = UI_BOARD.CELL_SIZE / 2;
    const halfCellWithPadding = cellWithPadding / 2;

    // Setup style
    this.ctx.lineWidth = UI_BOARD.PLANE_STROKE_WIDTH;
    if (plane.dead) {
      this.ctx.strokeStyle = UI_BOARD.PLANE_DEAD_BORDER_COLOR;
      this.ctx.fillStyle = UI_BOARD.PLANE_DEAD_COLOR;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowOffsetX = 3;
      this.ctx.shadowOffsetY = 3;
      this.ctx.shadowColor = "rgba(0, 0, 0, .5)";
    } else {
      this.ctx.strokeStyle = plane.color;
      this.ctx.fillStyle = UI_BOARD.PLANE_COLOR;
      this.ctx.shadowBlur = 20;
      this.ctx.shadowOffsetX = 10;
      this.ctx.shadowOffsetY = 10;
      this.ctx.shadowColor = "rgba(0, 0, 0, .2)";
    }
    this.ctx.beginPath();
    
    this.ctx.moveTo(headX + halfCellWithPadding, headY - halfCellWithPadding);    // 2
    this.ctx.lineTo(headX + halfCellWithPadding, headY + halfCell + padding);    // 3
    this.ctx.lineTo(headX + halfCellWithPadding + 2*cell, headY + halfCell + padding);    // 4
    this.ctx.lineTo(headX + halfCellWithPadding + 2*cell, headY + halfCell + padding + cellWithPadding);    // 5
    this.ctx.lineTo(headX + halfCellWithPadding, headY + halfCell + padding + cellWithPadding);    // 6
    this.ctx.lineTo(headX + halfCellWithPadding, headY + halfCell + 2*cell + padding);    // 7
    this.ctx.lineTo(headX + halfCellWithPadding + cell, headY + halfCell + 2*cell + padding);    // 8
    this.ctx.lineTo(headX + halfCellWithPadding + cell, headY + halfCell + 2*cell + padding + cellWithPadding);    // 9
    this.ctx.lineTo(headX - halfCellWithPadding - cell, headY + halfCell + 2*cell + padding + cellWithPadding);    // 10
    this.ctx.lineTo(headX - halfCellWithPadding - cell, headY + halfCell + 2*cell + padding);    // 11
    this.ctx.lineTo(headX - halfCellWithPadding, headY + halfCell + 2*cell + padding);    // 12
    this.ctx.lineTo(headX - halfCellWithPadding, headY + halfCell + padding + cellWithPadding);    // 13
    this.ctx.lineTo(headX - halfCellWithPadding - 2*cell, headY + halfCell + padding + cellWithPadding);    // 14
    this.ctx.lineTo(headX - halfCellWithPadding - 2*cell, headY + halfCell + padding);    // 15
    this.ctx.lineTo(headX - halfCellWithPadding, headY + halfCell + padding);    // 16
    this.ctx.lineTo(headX - halfCellWithPadding, headY - halfCellWithPadding);    // 1
    
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }

  drawBullets() {
    for (let bullet of this.bullets) {
      this.drawBullet(bullet);
    }
  }

  drawBullet(bullet) {
    if (bullet.type === POSITION_TYPE.BOARD) {
      this.ctx.fillStyle = UI_BOARD.BULLET_BOARD_COLOR;
      this.ctx.strokeStyle = UI_BOARD.BULLET_BOARD_STROKE_COLOR;
    } else if (bullet.type === POSITION_TYPE.BODY) {
      this.ctx.fillStyle = UI_BOARD.BULLET_BODY_COLOR;
      this.ctx.strokeStyle = UI_BOARD.BULLET_BODY_STROKE_COLOR;
    } else if (bullet.type === POSITION_TYPE.HEAD) {
      this.ctx.fillStyle = UI_BOARD.BULLET_HEAD_COLOR;
      this.ctx.strokeStyle = UI_BOARD.BULLET_HEAD_STROKE_COLOR;
    }
    this.ctx.lineWidth = UI_BOARD.BULLET_STROKE_WIDTH;

    const x1 = 0, y1 = -8;
    const x2 = 8, y2 = -17;
    const x3 = 17, y3 = -8;
    const x4 = -y1, y4 = x1;


    this.ctx.save();
    this.ctx.translate(bullet.x * UI_BOARD.CELL_SIZE + UI_BOARD.CELL_SIZE / 2, bullet.y * UI_BOARD.CELL_SIZE + UI_BOARD.CELL_SIZE / 2);
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.lineTo(x3, y3);
    this.ctx.lineTo(x4, y4);
  
    this.ctx.lineTo(x3, -y3);
    this.ctx.lineTo(x2, -y2);
    this.ctx.lineTo(x1, -y1);

    this.ctx.lineTo(-x2, -y2);
    this.ctx.lineTo(-x3, -y3);
    this.ctx.lineTo(-x4, -y4);

    this.ctx.lineTo(-x3, y3);
    this.ctx.lineTo(-x2, y2);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();
  }
}