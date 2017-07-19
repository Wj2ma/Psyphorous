let Action = require('./action').Action;
let C = require('./constants.js');
let Cell = require('./cell.js').Cell;

let Insects = require('./insects.js');
let Bee = Insects.Bee;
let QueenBee = Insects.QueenBee;

exports.Bot = class Bot {
  constructor(id, pollenMap) {
    this.id = id;

    let parsedMap = JSON.parse(pollenMap);
    this.height = parsedMap.length;
    this.width = parsedMap[0].length;

    (this.map = []).length = this.height;
    for (let y = 0; y < this.map.length; ++y) {
      (this.map[y] = []).length = this.width;
      for (let x = 0; x < this.map[y].length; ++x) {
        this.map[y][x] = new Cell({ x, y }, parsedMap[y][x].p);
      }
    }
  }

  getId() {
    return this.id;
  }

  computeNextMove(insects) {
    this.updateMap(insects);
    return JSON.stringify(this.getMoves());
  }

  updateMap(insects) {
    let pInsects = JSON.parse(insects);

    // Clear all insects.
    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        this.map[y][x].clearInsect();
      }
    }

    for (let pInsect of pInsects) {
      let insect = null;

      switch (insect.t) {
        case C.InsectType.BEE:
          insect = new Bee(pInsect.i, pInsect.b, { x: pInsect.x, y: pInsect.y }, pInsect.f, pInsect.c, pInsect.p);
          break;
        case C.InsectType.WASP:
          // TODO
          insect = new Bee(pInsect.i, pInsect.b, { x: pInsect.x, y: pInsect.y }, pInsect.f, pInsect.c, pInsect.p);
          break;
        case C.InsectType.QUEEN:
          insect = new QueenBee(pInsect.i, pInsect.b, { x: pInsect.x, y: pInsect.y }, pInsect.f, pInsect.c, pInsect.p);
          break;
      }

      this.map[pInsect.y][pInsect.x].setInsect(insect);
    }
  }

  getMoves() {
    return [];
  }

  getPath(from, to) {
    let path = { };

    let downDist = (this.height + to.y - from.y) % this.height;
    let upDist = (this.height + from.y - to.y) % this.height;
    let rightDist = (this.width + to.x - from.x) % this.width;
    let leftDist = (this.width + from.x - to.x) % this.width;

    if (to.y != from.y) {
      if (downDist > upDist) {
        path.move = C.Move.UP;
      } else {
        path.move = C.Move.DOWN;
      }
    } else if (to.x != from.x) {
      if (rightDist > leftDist) {
        path.move = C.Move.LEFT;
      } else {
        path.move = C.Move.RIGHT;
      }
    }

    path.dist = Math.min(rightDist, leftDist) + Math.min(downDist, upDist);

    return path;
  }
};

exports.RandomBot = class RandomBot extends exports.Bot {
  getMoves() {
    let moves = [];
    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        let insect = this.map[y][x].getInsect();
        if (insect && insect.getBotId() == this.id) {
          moves.push(new Action({ x, y }, Math.floor(Math.random() * 5), Math.floor(Math.random() * 4), Math.floor(Math.random() * (insect.getCount() + 1))));
        }
      }
    }
    return moves;
  }
};

// Bees go to nearest flower and return to queen bee when they have some pollen.
exports.HarvesterBot = class HarvesterBot extends exports.Bot {
  constructor(minPollen) {
    super();
    this.minPollen = minPollen || 1;
  }

  getMoves() {
    let moves = [];
    let flowerCells = [];
    let beeCells = [];
    let queenBeeCell;

    for (let y = 0; y < this.map.length; ++y) {
      for (let x = 0; x < this.map[y].length; ++x) {
        if (this.map[y][x].getPotency() > 0) {
          flowerCells.push(this.map[y][x]);
        }

        let insect = this.map[y][x].getInsect();
        if (insect && insect.getBotId() == this.id) {
          if (insect.getType() == C.InsectType.QUEENBEE) {
            queenBeeCell = this.map[y][x];
          } else {
            beeCells.push(this.map[y][x]);
          }
        }
      }
    }

    for (let beeCell of beeCells) {
      let insect = beeCell.getInsect();
      if (insect.getPollen() >= this.minPollen * insect.getCount()) {
        let path = this.getPath(beeCell.getPosition(), queenBeeCell.getPosition());
        moves.push(new Action(beeCell.getPosition(), path.move, path.move - 1, insect.getCount()));
      } else if (beeCell.getPotency() == 0) {
        let flowerCell = flowerCells[0];
        let minPath = this.getPath(beeCell.getPosition(), flowerCell.getPosition());
        for (let i = 1; i < flowerCells.length; ++i) {
          flowerCell = flowerCells[i];
          let path = this.getPath(beeCell.getPosition(), flowerCell.getPosition());
          if (path.dist < minPath.dist) {
            minPath = path;
          }
        }
        moves.push(new Action(beeCell.getPosition(), minPath.move, minPath.move - 1, insect.getCount()));
      }
    }

    moves.push(new Action(queenBeeCell.getPosition(), C.Move.STAY, Math.floor(Math.random() * 4), 1));

    return moves;
  }
};

// Bees go to nearest potent flower and return to queen bee when they have some pollen
exports.PotentBot = class PotentBot extends exports.Bot {
  constructor(minPollen, numDowns) {
    super();
    this.turns = 0;
    this.minPollen = minPollen || 1;
    this.numDowns = numDowns || 0;
  }

  getMoves() {
    let moves = [];
    let flowerCells = [];
    let beeCells = [];
    let queenBeeCell;

    for (let y = 0; y < this.map.length; ++y) {
      for (let x = 0; x < this.map[y].length; ++x) {
        if (map[y][x].getPotency() == C.Flower.POTENT) {
          flowerCells.push(this.map[y][x]);
        }

        let insect = map[y][x].getInsect();
        if (insect && insect.getBotId() == this.id) {
          if (insect.getType() == C.InsectType.QUEENBEE) {
            queenBeeCell = this.map[y][x];
          } else {
            beeCells.push(this.map[y][x]);
          }
        }
      }
    }

    for (let beeCell of beeCells) {
      let insect = beeCell.getInsect();
      if (insect.getPollen() > this.minPollen * insect.getCount()) {
        let path = this.getPath(beeCell.getPosition(), queenBeeCell.getPosition());
        moves.push(new Action(beeCell.getPosition(), path.move, path.move - 1, insect.getCount()));
      } else if (beeCell.getPotency() != C.Flower.POTENT) {
        let flowerCell = flowerCells[0];
        let minPath = this.getPath(beeCell.getPosition(), flowerCell.getPosition());
        for (let i = 1; i < flowerCells.length; ++i) {
          flowerCell = flowerCells[i];
          let path = this.getPath(beeCell.getPosition(), flowerCell.getPosition());
          if (path.dist < minPath.dist) {
            minPath = path;
          }
        }
        moves.push(new Action(beeCell.getPosition(), minPath.move, minPath.move - 1, insect.getCount()));
      }
    }

    if (this.turns++ < this.numDowns) {
      moves.push(new Action(queenBeeCell.getPosition(), C.Move.DOWN, Math.floor(Math.random() * 4), 1));
    } else {
      moves.push(new Action(queenBeeCell.getPosition(), C.Move.STAY, C.Face.LEFT, 1));
    }

    return moves;
  }
};