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
