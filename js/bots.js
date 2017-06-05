class Bot {
  init(id) {
    this.id = id;
  }

  getId() {
    return this.id;
  }

  computeNextMove(map) {
    return [];
  }

  getPath(map, fromY, fromX, toY, toX) {
    let path = { };

    let downDist = (map.length + toY - fromY) % map.length;
    let upDist = (map.length + fromY - toY) % map.length;
    let rightDist = (map[fromY].length + toX - fromX) % map[fromY].length;
    let leftDist = (map[fromY].length + fromX - toX) % map[fromY].length;

    if (toY != fromY) {
      if (downDist > upDist) {
        path.move = Move.UP;
      } else {
        path.move = Move.DOWN;
      }
    } else if (toX != fromX) {
      if (rightDist > leftDist) {
        path.move = Move.LEFT;
      } else {
        path.move = Move.RIGHT;
      }
    }

    path.dist = Math.min(rightDist, leftDist) + Math.min(downDist, upDist);

    return path;
  }
}

class RandomBot extends Bot {
  computeNextMove(map) {
    let moves = [];
    for (let y = 0; y < map.length; ++y) {
      for (let x = 0; x < map[y].length; ++x) {
        let insect = map[y][x].getInsect();
        if (insect && insect.getBotId() == this.id) {
          moves.push(new Action(x, y, Math.floor(Math.random() * 5), Math.floor(Math.random() * 4), insect.getCount()));
        }
      }
    }
    return moves;
  }
}

// Bees go to nearest flower and return to queen bee when they have some pollen.
class HarvesterBot extends Bot {
  computeNextMove(map) {
    let moves = [];
    let flowerCells = [];
    let beeCells = [];
    let queenBeeCell;

    for (let y = 0; y < map.length; ++y) {
      for (let x = 0; x < map[y].length; ++x) {
        if (map[y][x].getPotency() > 0) {
          flowerCells.push(map[y][x]);
        }

        let insect = map[y][x].getInsect();
        if (insect && insect.getBotId() == this.id) {
          if (insect.getType() == InsectType.QUEENBEE) {
            queenBeeCell = map[y][x];
          } else {
            beeCells.push(map[y][x]);
          }
        }
      }
    }

    for (let beeCell of beeCells) {
      let insect = beeCell.getInsect();
      if (insect.getPollen() > 0) {
        let path = this.getPath(map, beeCell.getY(), beeCell.getX(), queenBeeCell.getY(), queenBeeCell.getX());
        moves.push(new Action(beeCell.getX(), beeCell.getY(), path.move, path.move - 1, insect.getCount()));
      } else {
        let flowerCell = flowerCells[0];
        let minPath = this.getPath(map, beeCell.getY(), beeCell.getX(), flowerCell.getY(), flowerCell.getX());
        for (let i = 1; i < flowerCells.length; ++i) {
          flowerCell = flowerCells[i];
          let path = this.getPath(map, beeCell.getY(), beeCell.getX(), flowerCell.getY(), flowerCell.getX());
          if (path.dist < minPath.dist) {
            minPath = path;
          }
        }
        moves.push(new Action(beeCell.getX(), beeCell.getY(), minPath.move, minPath.move - 1, insect.getCount()));
      }
    }

    moves.push(new Action(queenBeeCell.getX(), queenBeeCell.getY(), Move.STAY, Math.floor(Math.random() * 4), 1));

    return moves;
  }
}

// Bees go to nearest potent flower and return to queen bee when they have some pollen
class PotentBot extends Bot {
  computeNextMove(map) {
    let moves = [];
    let flowerCells = [];
    let beeCells = [];
    let queenBeeCell;

    for (let y = 0; y < map.length; ++y) {
      for (let x = 0; x < map[y].length; ++x) {
        if (map[y][x].getPotency() == Flower.POTENT) {
          flowerCells.push(map[y][x]);
        }

        let insect = map[y][x].getInsect();
        if (insect && insect.getBotId() == this.id) {
          if (insect.getType() == InsectType.QUEENBEE) {
            queenBeeCell = map[y][x];
          } else {
            beeCells.push(map[y][x]);
          }
        }
      }
    }

    for (let beeCell of beeCells) {
      let insect = beeCell.getInsect();
      if (insect.getPollen() > 0) {
        let path = this.getPath(map, beeCell.getY(), beeCell.getX(), queenBeeCell.getY(), queenBeeCell.getX());
        moves.push(new Action(beeCell.getX(), beeCell.getY(), path.move, path.move - 1, insect.getCount()));
      } else {
        let flowerCell = flowerCells[0];
        let minPath = this.getPath(map, beeCell.getY(), beeCell.getX(), flowerCell.getY(), flowerCell.getX());
        for (let i = 1; i < flowerCells.length; ++i) {
          flowerCell = flowerCells[i];
          let path = this.getPath(map, beeCell.getY(), beeCell.getX(), flowerCell.getY(), flowerCell.getX());
          if (path.dist < minPath.dist) {
            minPath = path;
          }
        }
        moves.push(new Action(beeCell.getX(), beeCell.getY(), minPath.move, minPath.move - 1, insect.getCount()));
      }
    }

    moves.push(new Action(queenBeeCell.getX(), queenBeeCell.getY(), Move.STAY, Math.floor(Math.random() * 4), 1));

    return moves;
  }
}

// class RandomBot2 extends Bot {
//   computeNextMove(map) {
//     let moves = [];
//     let availMoves = [Move.STAY, Move.UP, Move.DOWN];
//     for (let y = 0; y < map.length; ++y) {
//       for (let x = 0; x < map[y].length; ++x) {
//         let cell = map[y][x];
//         if (cell.getBotId() == this.id) {
//           moves.push(new Action(x, y, availMoves[Math.floor(Math.random() * 3)]));
//         }
//       }
//     }
//     return moves;
//   }
// }
//
// class UpDownBot extends Bot {
//   constructor(move) {
//     super();
//     this.move = move;
//   }
//
//   computeNextMove(map) {
//     let moves = [];
//     for (let y = 0; y < map.length; ++y) {
//       for (let x = 0; x < map[y].length; ++x) {
//         let cell = map[y][x];
//         if (cell.getBotId() == this.id) {
//           moves.push(new Action(x, y, this.move));
//         }
//       }
//     }
//     return moves;
//   }
// }
//
// class UpDownBot2 extends Bot {
//   constructor(move) {
//     super();
//     this.turn = 0;
//     this.move = move;
//   }
//
//   computeNextMove(map) {
//     let moves = [];
//     for (let y = 0; y < map.length; ++y) {
//       for (let x = 0; x < map[y].length; ++x) {
//         let cell = map[y][x];
//         if (cell.getBotId() == this.id) {
//           moves.push(new Action(x, y, this.turn == 0 && x % 2 == 0 ? Move.STAY : this.move));
//         }
//       }
//     }
//     ++this.turn;
//     return moves;
//   }
// }
