class Canvas {
  constructor(width, height) {
    let canvas = document.getElementById('game');
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = canvas.getContext('2d');
    this.xStep = canvas.width / width;
    this.yStep = canvas.height / height;
    this.insectSize = Math.min(this.xStep / 2 - 8, this.yStep / 2 - 8);
    this.animations = [];
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
    this.ctx.strokeStyle = '#E4E4E4';
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

  drawFlowers(map) {
    for (let y = 0; y < map.length; ++y) {
      for (let x = 0; x < map[y].length; ++x) {
        let potency = map[y][x].getPotency();
        if (potency > 0) {
          this.drawFlower(this.mapXCoordToPixels(x), this.mapYCoordToPixels(y), potency);
        }
      }
    }
  }

  resetAnimations() {
    this.animations = new Map();
  }

  pushAnimation(insect, x, y, move) {
    this.animations.set(insect.getId(), {
      botId: insect.getBotId(),
      type: insect.getType(),
      face: insect.getFace(),
      count: insect.getCount(),
      pollen: insect.getPollen(),
      x: this.mapXCoordToPixels(x),
      y: this.mapYCoordToPixels(y),
      move
    });
  }

  animate(map, callback) {
    let lastAnimationTime = (new Date()).getTime();
    let totalTime = 0;
    let canvas = this;

    let animateFrame = function() {
      let callTime = (new Date()).getTime();
      let elapsedTime = callTime - lastAnimationTime;
      totalTime += elapsedTime;
      lastAnimationTime = callTime;
      canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.drawGrid();
      canvas.drawFlowers(map);

      for (let an of canvas.animations.values()) {
        let movementFace = an.face;
        switch (an.move) {
          case Move.UP:
            an.y = (canvas.height + an.y - elapsedTime * canvas.yStep / 500) % canvas.height;
            movementFace = Face.UP;
            break;
          case Move.RIGHT:
            an.x = (an.x + elapsedTime * canvas.xStep / 500) % canvas.width;
            movementFace = Face.RIGHT;
            break;
          case Move.DOWN:
            an.y = (an.y + elapsedTime * canvas.yStep / 500) % canvas.height;
            movementFace = Face.DOWN;
            break;
          case Move.LEFT:
            an.x = (canvas.width + an.x - elapsedTime * canvas.xStep / 500) % canvas.width;
            movementFace = Face.LEFT;
            break;
        }

        let img = canvas.getImage(an.botId, an.type);

        // Main creature.
        canvas.drawInsect(an.x, an.y, img, movementFace, an.count, an.pollen);

        // If creatures are to be wrapped around, draw the same creature on the other end.
        if (an.x > canvas.width - canvas.insectSize) {
          canvas.drawInsect(an.x - canvas.width, an.y, img, movementFace, an.count, an.pollen);
        } else if (an.x < canvas.insectSize) {
          canvas.drawInsect(an.x + canvas.width, an.y, img, movementFace, an.count, an.pollen);
        }

        if (an.y > canvas.height - canvas.insectSize) {
          canvas.drawInsect(an.x, an.y - canvas.height, img, movementFace, an.count, an.pollen);
        } else if (an.y < canvas.insectSize) {
          canvas.drawInsect(an.x, an.y + canvas.height, img, movementFace, an.count, an.pollen);
        }
      }

      if (totalTime < 500) {
        requestAnimationFrame(animateFrame);
      } else {
        canvas.drawFinalMap(map);
        setTimeout(callback, 500);
      }
    };

    requestAnimationFrame(animateFrame);
  }

  getImage(botId, type) {
    // TODO: This part is hardcoded to 2 bots.
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
    this.ctx.fillStyle = '#E4E4E4';
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

  drawFinalMap(map) {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.drawGrid();
    this.drawFlowers(map);

    for (let y = 0; y < map.length; ++y) {
      for (let x = 0; x < map[y].length; ++x) {
        let insect =  map[y][x].getInsect();
        if (insect) {
          this.drawInsect(
            this.mapXCoordToPixels(x),
            this.mapYCoordToPixels(y),
            this.getImage(insect.getBotId(), insect.getType()),
            insect.getFace(),
            insect.getCount(),
            insect.getPollen()
          );
        }
      }
    }
  }
}
