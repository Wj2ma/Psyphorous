/*
Replay file is in the following format
{
  // Map is a 2D array of objects which currently just have a p value for pollen.
  m: [
    [{ p: 0 }, { p: 1 }],
    [{ p: 1 }, { p: 2 }]
  ],
  // Turns is an array where each item represents a turn's data.
  t: [
    {
      // Insect data contains the final placements of each insect.
      // x = x position of insect
      // y = y position of insect
      // i = botId of insect
      // c = insect count
      // f = insect face
      // p = insect pollen count
      // t = insect type
      i: [{ x: 4, y: 10, i: 2, c: 15, f: 0, p: 10, t: 0}],
      // Turn data contains the list of moves for each insect. Parameters are the same as insect data, except m = move.
      t: [{ x: 1, y: 7, m: 1, i: 1, c: 12, f: 2, p: 2, t: 1 }]
    }
  ]
}
 */

const FLOWER = new Image();
FLOWER.src = 'images/flower.png';
const POTENT_FLOWER = new Image();
POTENT_FLOWER.src = 'images/potentFlower.png';
const BEES = [new Image(), new Image()];
const QUEEN_BEES = [new Image(), new Image()];
// TODO: This part is hardcoded to 2 bots.
for (let i = 0; i < 2; ++i) {
  BEES[i].src = 'images/bee' + (i + 1) + '.png';
  QUEEN_BEES[i].src = 'images/queen' + (i + 1) + '.png';
}

const ANIMATION_TIME = 500;
const PAUSE_TIME = 200;
const GRID_COLOUR = '#43a047';
const TEXT_COLOUR = '#424242';

const Move = {
  STAY: 0,
  UP: 1,
  RIGHT: 2,
  DOWN: 3,
  LEFT: 4
};

const Face = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3,
};

const InsectType = {
  BEE: 0,
  WASP: 1,
  QUEENBEE: 2
};

const Flower = {
  NONE: 0,
  REGULAR: 1,
  POTENT: 2
};

class Canvas {
  constructor() {
    let canvas = document.getElementById('game');
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = canvas.getContext('2d');
  }

  load(replay) {
    cancelAnimationFrame(this.animationFrame);
    clearTimeout(this.animateEvent);
    this.xStep = this.width / replay.m.length;
    this.yStep = this.height / replay.m[0].length;
    this.insectSize = Math.min(this.xStep / 2 - 8, this.yStep / 2 - 8);
    this.map = replay.m;
    this.turns = replay.t;
    this.turn = 0;
    this.animate();
  }

  // Maps x unit to the center of its grid position in pixels.
  mapXCoordToPixels(x) {
    return x * this.xStep;
  }

  // Maps y unit to the center of its grid position in pixels.
  mapYCoordToPixels(y) {
    return y * this.yStep;
  }

  drawGrid() {
    this.ctx.strokeStyle = GRID_COLOUR;
    this.ctx.beginPath();
    for (let x = this.xStep; x < this.width; x += this.xStep) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.width);
    }
    for (let y = this.yStep; y < this.height; y += this.yStep) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.height, y);
    }
    this.ctx.stroke();
  }

  drawFlowers() {
    for (let y = 0; y < this.map.length; ++y) {
      for (let x = 0; x < this.map[y].length; ++x) {
        let potency = this.map[y][x].p;
        if (potency > 0) {
          this.drawFlower(this.mapXCoordToPixels(x), this.mapYCoordToPixels(y), potency);
        }
      }
    }
  }

  animate() {
    cancelAnimationFrame(this.animationFrame);
    clearTimeout(this.animateEvent);
    let lastAnimationTime = (new Date()).getTime();
    let totalTime = 0;
    let canvas = this;

    let animations = this.turns[this.turn].t;
    for (let an of animations) {
      an.x = canvas.mapXCoordToPixels(an.x);
      an.y = canvas.mapYCoordToPixels(an.y);
    }

    let animateFrame = function() {
      let callTime = (new Date()).getTime();
      let elapsedTime = callTime - lastAnimationTime;
      totalTime += elapsedTime;
      lastAnimationTime = callTime;
      canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.drawGrid();
      canvas.drawFlowers();

      for (let an of animations) {
        let movementFace = an.f;
        switch (an.m) {
          case Move.UP:
            an.y = (canvas.height + an.y - elapsedTime * canvas.yStep / ANIMATION_TIME) % canvas.height;
            movementFace = Face.UP;
            break;
          case Move.RIGHT:
            an.x = (an.x + elapsedTime * canvas.xStep / ANIMATION_TIME) % canvas.width;
            movementFace = Face.RIGHT;
            break;
          case Move.DOWN:
            an.y = (an.y + elapsedTime * canvas.yStep / ANIMATION_TIME) % canvas.height;
            movementFace = Face.DOWN;
            break;
          case Move.LEFT:
            an.x = (canvas.width + an.x - elapsedTime * canvas.xStep / ANIMATION_TIME) % canvas.width;
            movementFace = Face.LEFT;
            break;
        }

        let img = canvas.getImage(an.i, an.t);

        // Main creature.
        canvas.drawInsect(an.x, an.y, img, movementFace, an.c, an.p);

        // If creatures are to be wrapped around, draw the same creature on the other end.
        if (an.x > canvas.width - canvas.insectSize) {
          canvas.drawInsect(an.x - canvas.width, an.y, img, movementFace, an.c, an.p);
        } else if (an.x < canvas.insectSize) {
          canvas.drawInsect(an.x + canvas.width, an.y, img, movementFace, an.c, an.p);
        }

        if (an.y > canvas.height - canvas.insectSize) {
          canvas.drawInsect(an.x, an.y - canvas.height, img, movementFace, an.c, an.p);
        } else if (an.y < canvas.insectSize) {
          canvas.drawInsect(an.x, an.y + canvas.height, img, movementFace, an.c, an.p);
        }
      }

      if (totalTime < ANIMATION_TIME) {
        canvas.animationFrame = requestAnimationFrame(animateFrame);
      } else {
        canvas.drawFinalMap();

        ++canvas.turn;
        if (canvas.turn < canvas.turns.length) {
          canvas.animateEvent = setTimeout(canvas.animate.bind(canvas), PAUSE_TIME);
        }
      }
    };

    this.animationFrame = requestAnimationFrame(animateFrame);
  }

  getImage(botId, type) {
    if (type == InsectType.BEE) {
      return BEES[botId];
    } else {
      return QUEEN_BEES[botId];
    }
  }

  drawInsect(x, y, img, face, count, pollen) {
    this.ctx.save();
    this.ctx.translate(x + this.xStep / 2, y + this.yStep / 2);
    this.ctx.rotate(((180 + face * 90) % 360) * Math.PI / 180);
    this.ctx.drawImage(
      img,
      -this.insectSize,
      -this.insectSize,
      this.insectSize * 2,
      this.insectSize * 2
    );
    this.ctx.restore();

    let fontSize = this.insectSize / 1.5;
    this.ctx.font = fontSize + 'px Arial';
    this.ctx.fillStyle = TEXT_COLOUR;
    this.ctx.fillText(count, x + fontSize / 6, y + fontSize);
    this.ctx.fillText(pollen, x + fontSize / 6, y + this.yStep - fontSize / 4);
  }

  drawFlower(x, y, potency) {
    if (potency == Flower.REGULAR) {
      this.ctx.drawImage(
        FLOWER,
        x + this.xStep / 2 - this.insectSize,
        y + this.yStep / 2 - this.insectSize,
        this.insectSize * 2,
        this.insectSize * 2
      );
    } else if (potency == Flower.POTENT) {
      this.ctx.drawImage(
        POTENT_FLOWER,
        x + this.xStep / 2 - this.insectSize ,
        y + this.yStep / 2 - this.insectSize,
        this.insectSize * 2,
        this.insectSize * 2
      );
    }
  }

  drawFinalMap() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.drawGrid();
    this.drawFlowers();

    let insects = this.turns[this.turn].i;
    for (let insect of insects) {
      this.drawInsect(
        this.mapXCoordToPixels(insect.x),
        this.mapYCoordToPixels(insect.y),
        this.getImage(insect.i, insect.t),
        insect.f,
        insect.c,
        insect.p
      );
    }
  }
}

let canvas;

document.addEventListener('DOMContentLoaded', function() {
  let fileReader = document.getElementById('fileReader');
  canvas = new Canvas();

  fileReader.addEventListener('drop', function(e) {
    e.preventDefault();
    let file = e.dataTransfer.files[0];
    let reader = new FileReader();

    reader.addEventListener('load', function (event) {
      let replay = JSON.parse(event.target.result);
      canvas.load(replay);
    });

    reader.readAsText(file);
  });

  fileReader.addEventListener('dragover', function(e) {
    e.preventDefault();
  });
});
