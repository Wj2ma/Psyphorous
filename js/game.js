let Cell = require('./cell.js').Cell;
let Insects = require('./insects.js');
let Bee = Insects.Bee;
let QueenBee = Insects.QueenBee;
let Bots = require('./bots.js');
let PotentBot = Bots.PotentBot;
let HarvesterBot = Bots.HarvesterBot;
let C = require('./constants.js');

let fileStream = require('fs');

class Game {
  constructor(bots, width, height) {
    this.bots = bots || [new PotentBot(), new HarvesterBot()];
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
            this.map[y][x] = new Cell(y, x, C.Flower.REGULAR);
            break;
          case 'P':
            this.map[y][x] = new Cell(y, x, C.Flower.POTENT);
            break;
          case 'W1':
            this.map[y][x] = new Cell(y, x, C.Flower.NONE, new Bee(this.insectId++, this.bots[0].getId(), C.Face.UP, x, y));
            break;
          case 'Q1':
            queenBee = new QueenBee(this.insectId++, this.bots[0].getId(), C.Face.UP, x, y);
            this.queenBees.push(queenBee);
            this.map[y][x] = new Cell(y, x, C.Flower.NONE, queenBee);
            break;
          case 'W2':
            this.map[y][x] = new Cell(y, x, C.Flower.NONE, new Bee(this.insectId++, this.bots[1].getId(), C.Face.UP, x, y));
            break;
          case 'Q2':
            queenBee = new QueenBee(this.insectId++, this.bots[1].getId(), C.Face.UP, x, y);
            this.queenBees.push(queenBee);
            this.map[y][x] = new Cell(y, x, C.Flower.NONE, queenBee);
            break;
          default:
            this.map[y][x] = new Cell(y, x, C.Flower.NONE);
        }
      }
    }

    this.output = { m: this.getMapReplayData(), t: [{ t: [], n: [], u: { }, i: this.getInsectReplayData() }] };

    this.runGame();
  }

  runGame() {
    let gameEnded = false;
    let turn = 0;

    for (; turn < C.MAX_TURNS /*10 * Math.sqrt(this.width * this.height)*/ && !gameEnded; ++turn) {
      let turnsOutput = { t: [], n: [], u: {} };
      let botsActions = [];

      // Grab all the bots actions.
      for (let i = 0; i < this.bots.length; ++i) {
        botsActions.push(this.bots[i].computeNextMove(this.map));
      }

      this.updateMap(botsActions, turnsOutput);
      this.spawnBees();
      this.resolveConflicts();
      this.computeDamages();
      this.calculatePollen();
      gameEnded = this.didGameEnd(turn + 1);

      turnsOutput.i = this.getInsectReplayData();
      this.output.t.push(turnsOutput);
    }

    if (!gameEnded) {
      let botPoints = [];
      botPoints.length = this.bots.length;
      botPoints.fill(0);
      for (let y = 0; y < this.height; ++y) {
        for (let x = 0; x < this.width; ++x) {
          let insect = this.map[y][x].getInsect();
          if (insect) {
            botPoints[insect.getBotId()] += insect.getCount();
          }
        }
      }

      for (let i = 0; i < botPoints.length; ++i) {
        botPoints[i] += this.queenBees[i].getPollen() / 5;
      }

      console.log('The game has ended after ' + turn + ' turns. Here are the following scores:');
      let winners = [];
      let maxPoints = 0;
      for (let i = 0; i < botPoints.length; ++i) {
        console.log('Bot ' + (this.bots[i].getId() + 1) + ' scored ' + botPoints[i] + ' points!');
        if (maxPoints < botPoints[i]) {
          winners = [this.bots[i].getId() + 1];
          maxPoints = botPoints[i];
        } else if (maxPoints == botPoints[i]) {
          winners.push(this.bots[i].getId() + 1);
        }
      }
      if (winners.length > 1) {
        console.log('Bots ' + winners + ' all tie for first!');
      } else {
        console.log('Bot ' + winners[0] + ' wins!');
      }
    }

    fileStream.writeFile("replay", JSON.stringify(this.output), function (err) {
      if (err) {
        console.log(err);
      }

      console.log("Replay created.");
    });
  }

  // Aggregate all the actions into the map.
  updateMap(botsActions, turnsOutput) {
    for (let i = 0; i < this.bots.length; ++i) {
      let bot = this.bots[i];
      let botActions = botsActions[i];
      for (let j = 0; j < botActions.length; ++j) {
        let action = botActions[j];
        let x = action.getX();
        let y = action.getY();
        let insect = this.map[y][x].getInsect();
        let pos = insect.getPosition();
        // Validate that the insect belongs to this bot, and also it has not been moved yet.
        if (insect.getBotId() == bot.getId() && pos.x == x && pos.y == y) {
          switch (action.getMove()) {
            case C.Move.UP:
              this.makeMove((this.height + y - 1) % this.height, x, y, x, action, turnsOutput);
              break;
            case C.Move.RIGHT:
              this.makeMove(y, (x + 1) % this.width, y, x, action, turnsOutput);
              break;
            case C.Move.DOWN:
              this.makeMove((y + 1) % this.height, x, y, x, action, turnsOutput);
              break;
            case C.Move.LEFT:
              this.makeMove(y, (this.width + x - 1) % this.width, y, x, action, turnsOutput);
              break;
            default:
              insect.changeFace(action.getFace());
              break;
          }
        } // Else invalid action.
      }
    }
  }

  makeMove(newY, newX, currY, currX, action, turnsOutput) {
    if (action.getAmount() > 0) {
      let insect = this.map[currY][currX].getInsect();
      // Case when user doesn't move all bees off the square
      if (action.getAmount() < insect.getCount()) {
        let pollenToGive = insect.splitOff(action.getAmount());
        // TODO: Need to distinguish whether bee or wasp.
        let newInsect = new Bee(
          this.insectId++,
          insect.getBotId(),
          action.getFace(),
          newX,
          newY,
          action.getAmount(),
          pollenToGive
        );
        this.map[newY][newX].pushInsect(newInsect);
        turnsOutput.n.push(Object.assign({ x: currX, y: currY }, newInsect.getReplayData()));
        turnsOutput.u[insect.getId()] = { c: insect.getCount(), p: insect.getPollen() };
        turnsOutput.t.push({ i: newInsect.getId(), m: action.getMove() });
      } else {
        let insect = this.map[currY][currX].shiftInsect();
        insect.changeFace(action.getFace());
        insect.setPosition({ x: newX, y: newY });
        this.map[newY][newX].pushInsect(insect);
        turnsOutput.t.push({ i: insect.getId(), m: action.getMove() });
      }
    }
  }

  // Spawn bees if sufficient pollen is made.
  spawnBees() {
    for (let queenBee of this.queenBees) {
      let bees = queenBee.spawnBees();
      if (bees > 0) {
        let pos = queenBee.getPosition();
        switch (queenBee.getFace()) {
          case C.Face.UP:
            pos.y = (pos.y + 1) % this.height;
            break;
          case C.Face.RIGHT:
            pos.x = (this.width + pos.x - 1) % this.width;
            break;
          case C.Face.DOWN:
            pos.y = (this.height + pos.y - 1) % this.height;
            break;
          case C.Face.LEFT:
            pos.x = (pos.x + 1) % this.width;
            break;
        }
        this.map[pos.y][pos.x].pushInsect(
          new Bee(this.insectId++, queenBee.getBotId(), queenBee.getFace(), pos.x, pos.y, bees));
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
    for (let queenBee of this.queenBees) {
      let pos = queenBee.getPosition();
      this.maybeHarvestPollen(queenBee, pos.y + 1, pos.x - 1);
      this.maybeHarvestPollen(queenBee, pos.y + 1, pos.x);
      this.maybeHarvestPollen(queenBee, pos.y + 1, pos.x + 1);
      this.maybeHarvestPollen(queenBee, pos.y - 1, pos.x - 1);
      this.maybeHarvestPollen(queenBee, pos.y - 1, pos.x);
      this.maybeHarvestPollen(queenBee, pos.y - 1, pos.x + 1);
      this.maybeHarvestPollen(queenBee, pos.y, pos.x - 1);
      this.maybeHarvestPollen(queenBee, pos.y, pos.x + 1);
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
        if (insect && insect.getType != C.InsectType.QUEENBEE) {
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

  getMapReplayData() {
    let replayMap = [];
    replayMap.length = this.map.length;
    for (let y = 0; y < this.map.length; ++y) {
      (replayMap[y] = []).length = this.map[y].length;
      for (let x = 0; x < this.map[y].length; ++x) {
        replayMap[y][x] = this.map[y][x].getReplayData();
      }
    }
    return replayMap;
  }

  getInsectReplayData() {
    let insectData = [];
    for (let y = 0; y < this.map.length; ++y) {
      for (let x = 0; x < this.map[y].length; ++x) {
        let insect = this.map[y][x].getInsect();
        if (insect != null) {
          insectData.push(Object.assign({ x, y }, insect.getReplayData()));
        }
      }
    }
    return insectData;
  }
}

function start() {
  new Game();
}

new Game();