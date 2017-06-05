/*
F - F - - - - - - F
- W W W - F - F - -
- W Q W - F - - F -
- W W W - F - - - -
- - - - P P - - - -
- - - - P P - - - -
- - - - F - W W W -
- F - - F - W Q W -
- - F - F - W W W -
F - - - - - - F - F
*/

class Game {
  constructor(bots, width, height) {
    this.bots = bots || [new RandomBot(), new HarvesterBot()];
    this.width = 10;
    this.height = 10;

    // let initErrors = false;
    // if (width < 4 || width > 100) {
    //   console.log('4 <= width <= 100');
    //   initErrors = true;
    // }
    // if (height < 4 || height > 100) {
    //   console.log('4 <= height <= 100');
    //   initErrors = true;
    // }
    // if (bots.length != 2) {
    //   console.log('Sorry, only 2 bots are supported right now');
    //   initErrors = true;
    // }
    // if (initErrors) {
    //   return;
    // }

    for (let i = 0; i < this.bots.length; ++i) {
      this.bots[i].init(i);
    }

    this.insectId = 0;
    this.queenBees = [];
    let hardcodedMap = [
      ['F', '-', 'F', '-', '-', '-', '-', '-', '-', 'F'],
      ['-', 'W1', 'W1', 'W1', '-', 'F', '-', 'F', '-', '-'],
      ['-', 'W1', 'Q1', 'W1', '-', 'F', '-', '-', 'F', '-'],
      ['-', 'W1', 'W1', 'W1', '-', 'F', '-', '-', '-', '-'],
      ['-', '-', '-', '-', 'P', 'P', '-', '-', '-', '-'],
      ['-', '-', '-', '-', 'P', 'P', '-', '-', '-', '-'],
      ['-', '-', '-', '-', 'F', '-', 'W2', 'W2', 'W2', '-'],
      ['-', 'F', '-', '-', 'F', '-', 'W2', 'Q2', 'W2', '-'],
      ['-', '-', 'F', '-', 'F', '-', 'W2', 'W2', 'W2', '-'],
      ['F', '-', '-', '-', '-', '-', '-', 'F', '-', 'F'],
    ];
    (this.map = []).length = 10;
    for (let y = 0; y < 10; ++y) {
      (this.map[y] = []).length = 10;
      for (let x = 0; x < 10; ++x) {
        let queenBee;
        switch (hardcodedMap[y][x]) {
          case 'F':
            this.map[y][x] = new Cell(y, x, Flower.REGULAR);
            break;
          case 'P':
            this.map[y][x] = new Cell(y, x, Flower.POTENT);
            break;
          case 'W1':
            this.map[y][x] = new Cell(y, x, Flower.NONE, new Bee(this.insectId++, this.bots[0].getId()));
            break;
          case 'Q1':
            queenBee = new QueenBee(this.insectId++, this.bots[0].getId());
            this.queenBees.push(queenBee);
            this.map[y][x] = new Cell(y, x, Flower.NONE, queenBee);
            break;
          case 'W2':
            this.map[y][x] = new Cell(y, x, Flower.NONE, new Bee(this.insectId++, this.bots[1].getId()));
            break;
          case 'Q2':
            queenBee = new QueenBee(this.insectId++, this.bots[1].getId());
            this.queenBees.push(queenBee);
            this.map[y][x] = new Cell(y, x, Flower.NONE, queenBee);
            break;
          default:
            this.map[y][x] = new Cell(y, x, Flower.NONE);
        }
      }
    }

    // let creatureIds = 0;
    // (this.map = []).length = height;
    // for (let y = 0; y < height; ++y) {
    //   (this.map[y] = []).length = width;
    //   for (let x = 0; x < width; ++x) {
    //     // TODO: This part is hardcoded to 2 bots and set locations. Need to change later.
    //     if (y == 1 && x >= 1 && x <= width - 2) {
    //       this.map[y][x] = [new Cell(bots[0].getId(), new Skeleton(creatureIds++))];
    //     } else if (y == height - 2 && x >= 1 && x <= width - 2) {
    //       this.map[y][x] = [new Cell(bots[1].getId(), new Skeleton(creatureIds++))];
    //     } else {
    //       this.map[y][x] = [NEUTRAL_CELL];
    //     }
    //   }
    // }

    // this.canvas = new Canvas(width, height);

    this.canvas = new Canvas(10, 10);

    this.runGame();
  }

  runGame() {
    let turns = 0;
    let gameEnded = false;
    let game = this;
    this.canvas.drawFinalMap(this.map);
    let turn = function() {
      if (turns >= 20/*10 * Math.sqrt(game.width * game.height)*/ || gameEnded) {
        // Max turns reached. Winner will be determined by sum of all insects they own.
        if (!gameEnded) {
          let botPoints = [];
          botPoints.length = game.bots.length;
          botPoints.fill(0);
          for (let y = 0; y < game.height; ++y) {
            for (let x = 0; x < game.width; ++x) {
              let insect = game.map[y][x].getInsect();
              if (insect) {
                botPoints[insect.getBotId()] += insect.getCount();
              }
            }
          }

          for (let i = 0; i < botPoints.length; ++i) {
            botPoints[i] += game.queenBees[i].getPollen() / 5;
          }

          console.log('The game has ended after ' + turns + ' turns. Here are the following scores:');
          let winners = [];
          let maxPoints = 0;
          for (let i = 0; i < botPoints.length; ++i) {
            console.log('Bot ' + (game.bots[i].getId() + 1) + ' scored ' + botPoints[i] + ' points!');
            if (maxPoints < botPoints[i]) {
              winners = [game.bots[i].getId() + 1];
              maxPoints = botPoints[i];
            } else if (maxPoints == botPoints[i]) {
              winners.push(game.bots[i].getId() + 1);
            }
          }
          if (winners.length > 1) {
            console.log('Bots ' + winners + ' all tie for first!');
          } else {
            console.log('Bot ' + winners[0] + ' wins!');
          }
        }
      } else {
        let botsActions = [];

        // Grab all the bots actions.
        for (let i = 0; i < game.bots.length; ++i) {
          botsActions.push(game.bots[i].computeNextMove(game.map));
        }

        game.updateMap(botsActions);
        // Add still animations.
        for (let y = 0; y < game.height; ++y) {
          for (let x = 0; x < game.width; ++x) {
            if (game.map[y][x].containsStillInsect()) {
              game.canvas.pushAnimation(game.map[y][x].getInsect(), x, y, Move.STAY);
            }
          }
        }
        game.spawnBees();
        game.resolveConflicts();
        game.computeDamages();
        game.calculatePollen();
        gameEnded = game.didGameEnd(++turns);

        game.canvas.animate(game.map, turn);
      }
    };

    setTimeout(turn, 500);
  }

  // Aggregate all the actions into the map.
  updateMap(botsActions) {
    this.canvas.resetAnimations();

    for (let i = 0; i < this.bots.length; ++i) {
      let bot = this.bots[i];
      let botActions = botsActions[i];
      for (let j = 0; j < botActions.length; ++j) {
        let action = botActions[j];
        let x = action.getX();
        let y = action.getY();
        let insect = this.map[y][x].getInsect();
        if (insect.getBotId() == bot.getId()) {
          switch (action.getMove()) {
            case Move.UP:
              this.makeMove((this.height + y - 1) % this.height, x, y, x, action);
              this.canvas.pushAnimation(insect, x, y, Move.UP);
              break;
            case Move.RIGHT:
              this.makeMove(y, (x + 1) % this.width, y, x, action);
              this.canvas.pushAnimation(insect, x, y, Move.RIGHT);
              break;
            case Move.DOWN:
              this.makeMove((y + 1) % this.height, x, y, x, action);
              this.canvas.pushAnimation(insect, x, y, Move.DOWN);
              break;
            case Move.LEFT:
              this.makeMove(y, (this.width + x - 1) % this.width, y, x, action);
              this.canvas.pushAnimation(insect, x, y, Move.LEFT);
              break;
            default:
              this.map[y][x].getInsect().changeFace(action.getFace());
              break;
          }
        } // Else invalid action.
      }
    }
  }

  makeMove(newY, newX, currY, currX, action) {
    if (action.getAmount() > 0) {
      let insect = this.map[currY][currX].getInsect();
      // Case when user doesn't move all bees off the square
      if (action.getAmount() < insect.getCount()) {
        let pollenToGive = insect.splitOff(action.getAmount());
        // TODO: Need to distinguish whether bee or wasp.
        this.map[newY][newX].pushInsect(
          new Bee(
            this.insectId++,
            insect.getBotId(),
            action.getFace(),
            action.getAmount(),
            pollenToGive
          )
        );
      } else {
        let insect = this.map[currY][currX].shiftInsect();
        insect.changeFace(action.getFace());
        this.map[newY][newX].pushInsect(insect);
      }
    }
  }

  // Spawn bees if sufficient pollen is made.
  spawnBees() {
    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        let insect = this.map[y][x].getInsect();
        if (insect && insect.getType() == InsectType.QUEENBEE) {
          let bees = insect.spawnBees();
          if (bees > 0) {
            let newBees = new Bee(this.insectId++, insect.getBotId(), insect.getFace(), bees);
            switch (insect.getFace()) {
              case Face.UP:
                this.map[(y + 1) % this.height][x].pushInsect(newBees);
                break;
              case Face.RIGHT:
                this.map[y][(this.width + x - 1) % this.width].pushInsect(newBees);
                break;
              case Face.DOWN:
                this.map[(this.height + y - 1) % this.height][x].pushInsect(newBees);
                break;
              case Face.LEFT:
                this.map[y][(x + 1) % this.width].pushInsect(newBees);
                break;
            }
          }
        }
      }
    }
  }

  // Reduce all conflicting squares (more than one cell in that square).
  // Also add a neutral cell to empty squares.
  resolveConflicts() {
    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        this.map[y][x].resolveConflicts();
      }
    }
  }

  // TODO: Compute all insect attacks on each other. For now, conflicts are the only means of attacking.
  computeDamages() {

  }

  calculatePollen() {
    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        let insect = this.map[y][x].getInsect();
        if (insect && insect.getType() == InsectType.QUEENBEE) {
          this.maybeHarvestPollen(insect, y + 1, x - 1);
          this.maybeHarvestPollen(insect, y + 1, x);
          this.maybeHarvestPollen(insect, y + 1, x + 1);
          this.maybeHarvestPollen(insect, y - 1, x - 1);
          this.maybeHarvestPollen(insect, y - 1, x);
          this.maybeHarvestPollen(insect, y - 1, x + 1);
          this.maybeHarvestPollen(insect, y, x - 1);
          this.maybeHarvestPollen(insect, y, x + 1);
        }
      }
    }

    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.height; ++x) {
        let insect = this.map[y][x].getInsect();
        if (insect) {
          insect.collectPollen(this.map[y][x].getPotency());
        }
      }
    }
  }

  // A player is out
  didGameEnd(turns) {
    let winningId = -1;
    let isWinPossible = true;
    for (let y = 0; y < this.height && isWinPossible; ++y) {
      for (let x = 0; x < this.width && isWinPossible; ++x) {
        let insect = this.map[y][x].getInsect();
        if (insect && insect.getType != InsectType.QUEENBEE) {
          if (winningId == -1) {
            winningId = insect.getBotId();
          } else if (winningId != insect.getBotId()) {
            isWinPossible = false;
          }
        }
      }
    }

    if (isWinPossible) {
      console.log('The game has ended after ' + turns + ' turns.');
      if (winningId == -1) {
        console.log('Tie game!');
      } else {
        console.log('Bot ' + winningId + ' wins!');
      }
      return true;
    }
    return false;
  }

  maybeHarvestPollen(queenBee, y, x) {
    y = (y + this.height) % this.height;
    x = (x + this.width) % this.width;
    let insect = this.map[y][x].getInsect();
    if (insect && insect.getBotId() == queenBee.getBotId()) {
      queenBee.takePollen(insect.depositPollen());
    }
  }
}

function start() {
  new Game();
}

/*
Design game and stuff...

- flowers around the map
- start with n bees and 1 queen
- queen does not collect pollen or attack
- if bee is on flower, they collect pollen
- bees have a maximum capacity of pollen to carry
- bees also stack in cells (can split)
- bring back pollen to queen bee to produce more bees
- instant pollen when move to a flower, must stay to continue harvesting pollen and will not be able to attack
- bees stack
- 5 pollen == 1 bee
- max 3 pollen per bee
- max 100 bees
-more potent flowers and less potent that give more pollen per round
-if bee dies, pollen can be picked up, or it can be removed from the game
- every attack on queen bee will need to be replenished with pollen. For example, if she was hit 3 times, she would need 3 pollen before being able to produce more bees.

Attack
- hit 3 where you are facing or hit 3 in a straight line

Moves:
UP
DOWN
RIGHT
LEFT
STAY/HARVEST

AfterMoves:
FACE_UP
FACE_DOWN
FACE_RIGHT
FACE_LEFT

Each turn:
Move
Face direction
Spawn
Attack
Grab Pollen
*/