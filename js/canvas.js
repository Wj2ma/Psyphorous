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
    return x * this.xStep + this.xStep / 2;
  }

  // Maps y unit to the center of its grid position in pixels.
  mapYCoordToPixels(y) {
    return y * this.yStep + this.yStep / 2;
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
      count: insect.getCount(),
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
        switch (an.move) {
          case Move.UP:
            an.y = (canvas.height + an.y - elapsedTime * canvas.yStep / 500) % canvas.height;
            break;
          case Move.RIGHT:
            an.x = (an.x + elapsedTime * canvas.xStep / 500) % canvas.width;
            break;
          case Move.DOWN:
            an.y = (an.y + elapsedTime * canvas.yStep / 500) % canvas.height;
            break;
          case Move.LEFT:
            an.x = (canvas.width + an.x - elapsedTime * canvas.xStep / 500) % canvas.width;
            break;
        }

        let colour = canvas.getColour(an.botId, an.type);

        // Main creature.
        canvas.drawInsect(an.x, an.y, colour, an.count);

        // If creatures are to be wrapped around, draw the same creature on the other end.
        if (an.x > canvas.width - canvas.insectSize) {
          canvas.drawInsect(an.x - canvas.width, an.y, colour, an.count);
        } else if (an.x < canvas.insectSize) {
          canvas.drawInsect(an.x + canvas.width, an.y, colour, an.count);
        }

        if (an.y > canvas.height - canvas.insectSize) {
          canvas.drawInsect(an.x, an.y - canvas.height, colour, an.count);
        } else if (an.y < canvas.insectSize) {
          canvas.drawInsect(an.x, an.y + canvas.height, colour, an.count);
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

  getColour(botId, type) {
    // TODO: This part is hardcoded to 2 bots.
    switch (botId) {
      case 1:
        if (type == InsectType.BEE) {
          return '#FFAAAA';
        } else {
          return '#FF0030';
        }
      case 2:
        if (type == InsectType.BEE) {
          return '#AAAAFF';
        } else {
          return '#0032FF';
        }
    }
  }

  drawInsect(x, y, colour, count) {
    this.ctx.fillStyle = colour;
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.insectSize, 0, 2 * Math.PI);
    this.ctx.fill();

    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#E4E4E4';
    this.ctx.fillText(count, x - 5, y + 6);
  }

  drawFlower(x, y, potency) {
    if (potency == Flower.REGULAR) {
      this.ctx.drawImage(FLOWER, x - this.insectSize, y - this.insectSize, this.insectSize * 2, this.insectSize * 2);
    } else if (potency == Flower.POTENT) {
      this.ctx.drawImage(POTENT_FLOWER, x - this.insectSize, y - this.insectSize, this.insectSize * 2, this.insectSize * 2);
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
            this.getColour(insect.getBotId(), insect.getType()),
            insect.getCount()
          );
        }
      }
    }
  }
}
