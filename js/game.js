const Move = {
  STAY: 0,
  UP: 1,
  RIGHT: 2,
  DOWN: 3,
  LEFT: 4
};

class Creature {
  getAttack() {
    return 0;
  }

  getLife() {
    return 0;
  }

  takeDamage(damage) {

  }
}

class Skeleton extends Creature {
  constructor() {
    super();
    this.attack = 1;
    this.hp = 5;
  }

  getAttack() {
    return this.attack;
  }

  getLife() {
    return this.hp;
  }

  takeDamage(damage) {
    this.hp -= damage;
  }
}

class Cell {
  constructor(id, creature) {
    this.id = id;
    this.creature = creature;
  }

  getId() {
    return this.id;
  }

  getCreature() {
    return this.creature;
  }

  // TODO: Refactor this crud.
  getAttack() {
    if (this.creature) {
      return this.creature.getAttack();
    } else {
      return 0;
    }
  }

  // TODO: Refactor this crud.
  getLife() {
    if (this.creature) {
      return this.creature.getLife();
    } else {
      return 0;
    }
  }

  // TODO: Refactor this crud.
  takeDamage(damage) {
    if (this.creature) {
      this.creature.takeDamage(damage);
    }
  }
}

class Action {
  constructor(x, y, move) {
    this.x = x;
    this.y = y;
    this.move = move;
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getMove() {
    return this.move;
  }
}

class Bot {
  init(id) {
    this.id = id;
  }

  getId() {
    return this.id;
  }

  computeNextMove(map) {
    var moves = [];
    for (var y = 0; y < map.length; ++y) {
      for (var x = 0; x < map[y].length; ++x) {
        var cell = map[y][x];
        if (cell.getId() == this.id) {
          moves.push(new Action(x, y, Math.floor(Math.random() * 5)));
        }
      }
    }
    return moves;
  }
}

class Game {
  constructor(bots, width, height) {
    this.NEUTRAL_ID = 0;
    this.NEUTRAL_CELL = new Cell(this.NEUTRAL_ID, null);
    this.bots = bots;
    this.width = width;
    this.height = height;

    var initErrors = false;
    if (width < 4 || width > 100) {
      console.log('4 <= width <= 100');
      initErrors = true;
    }
    if (height < 4 || height > 100) {
      console.log('4 <= height <= 100');
      initErrors = true;
    }
    if (bots.length != 2) {
      console.log('Sorry, only 2 bots are supported right now');
      initErrors = true;
    }
    if (initErrors) {
      return;
    }

    for (var i = 0; i < bots.length; ++i) {
      this.bots[i].init(i + 1);
    }

    (this.map = []).length = height;
    for (var y = 0; y < height; ++y) {
      (this.map[y] = []).length = width;
      for (var x = 0; x < width; ++x) {
        // This part is hardcoded to 2 bots and set locations. Need to change later.
        if (y == 1 && x >= 1 && x <= width - 2) {
          this.map[y][x] = [new Cell(bots[0].getId(), new Skeleton())];
        } else if (y == height - 2 && x >= 1 && x <= width - 2) {
          this.map[y][x] = [new Cell(bots[1].getId(), new Skeleton())];
        } else {
          this.map[y][x] = [this.NEUTRAL_CELL];
        }
      }
    }

    this.runGame();
  }

  // Runs the game.
  runGame() {
    var turns = 0;
    var gameEnded = false;
    for (; turns < 10 * Math.sqrt(this.width * this.height) && !gameEnded; ++turns) {
      var dupedMap = this.cloneMap();
      var botsActions = [];

      // Grab all the bots actions.
      for (var i = 0; i < this.bots.length; ++i) {
        botsActions.push(this.bots[i].computeNextMove(dupedMap));
      }

      this.updateMap(botsActions, dupedMap);
      this.resolveConflicts();
      this.computeDamages();
      this.removeTheDead();
      gameEnded = this.didGameEnd(turns);
    }

    // Max turns reached. Winner will be determined by sum of hp and attack they have.
    if (!gameEnded) {
      var botPoints = [];
      botPoints.length = this.bots.length;
      botPoints.fill(0);
      for (var y = 0; y < this.height; ++y) {
        for (var x = 0; x < this.width; ++x) {
          var cell = this.map[y][x][0];
          botPoints[cell.getId() - 1] += cell.getAttack() + cell.getLife();
        }
      }

      console.log('The game has ended after ' + turns + ' turns. Here are the following scores:');
      var winners = [];
      var maxPoints = 0;
      for (var i = 0; i < botPoints.length; ++i) {
        console.log('Bot ' + this.bots[i].getId() + ' scored ' + botPoints[i] + ' points!');
        if (maxPoints < botPoints[i]) {
          winners = [this.bots[i].getId()];
          maxPoints = botPoints[i];
        } else if (maxPoints == botPoints[i]) {
          winners.push(this.bots[i].getId());
        }
      }
      if (winners.length > 1) {
        console.log('Bots ' + winners + ' all tie for first!');
      } else {
        console.log('Bot ' + winners[0] + ' wins!');
      }
    }
  }

  // Aggregate all the actions into the map.
  updateMap(botsActions, dupedMap) {
    for (var i = 0; i < this.bots.length; ++i) {
      var bot = this.bots[i];
      var botActions = botsActions[i];
      for (var j = 0; j < botActions.length; ++j) {
        var action = botActions[j];
        var x = action.getX();
        var y = action.getY();
        var cell = dupedMap[y][x];
        if (cell.getId() == bot.getId()) {
          switch (action.getMove()) {
            case Move.UP:
              this.map[(this.height + y - 1) % this.height][x].push(this.map[y][x].shift());
              break;
            case Move.RIGHT:
              this.map[y][(x + 1) % this.width].push(this.map[y][x].shift());
              break;
            case Move.DOWN:
              this.map[(y + 1) % this.height][x].push(this.map[y][x].shift());
              break;
            case Move.LEFT:
              this.map[y][(this.width + x - 1) % this.width].push(this.map[y][x].shift());
              break;
          }
        } // Else invalid action.
      }
    }
  }

  // Reduce all conflicting squares (more than one cell in that square).
  // Also add a neutral cell to empty squares.
  resolveConflicts() {
    for (var y = 0; y < this.height; ++y) {
      for (var x = 0; x < this.width; ++x) {
        var cells = this.map[y][x];
        // Everyone takes damage from everyone until there is a last man standing, or everyone dies.
        while (cells.length > 1) {
          for (var i = 0; i < cells.length; ++i) {
            var cellToDamage = cells[i];
            for (var j = 0; j < cells.length; ++j) {
              var attackerCell = cells[j];
              if (cellToDamage != attackerCell) {
                cellToDamage.takeDamage(attackerCell.getAttack());
              }
            }
          }
          cells = cells.filter(function(cell) {
            return cell.getLife() > 0;
          });
        }

        if (cells.length == 0) {
          cells.push(this.NEUTRAL_CELL);
        }

        // Reassign because cells could be a filtered version of the array.
        this.map[y][x] = cells;
      }
    }
  }

  // Take damage from all adjacent squares that do not have the same ID.
  computeDamages() {
    for (var y = 0; y < this.height; ++y) {
      for (var x = 0; x < this.width; ++x) {
        var cellToDamage = this.map[y][x][0];
        if (cellToDamage != this.NEUTRAL_CELL) {
          this.takeDamage(cellToDamage, y + 1, x - 1);
          this.takeDamage(cellToDamage, y + 1, x);
          this.takeDamage(cellToDamage, y + 1, x + 1);
          this.takeDamage(cellToDamage, y - 1, x - 1);
          this.takeDamage(cellToDamage, y - 1, x);
          this.takeDamage(cellToDamage, y + 1, x + 1);
          this.takeDamage(cellToDamage, y, x - 1);
          this.takeDamage(cellToDamage, y, x + 1);
        }
      }
    }
  }

  removeTheDead() {
    for (var y = 0; y < this.height; ++y) {
      for (var x = 0; x < this.width; ++x) {
        var cell = this.map[y][x][0];
        if (cell != this.NEUTRAL_CELL && cell.getLife() <= 0) {
          this.map[y][x].shift();
          this.map[y][x].push(this.NEUTRAL_CELL);
        }
      }
    }
  }

  didGameEnd(turns) {
    var winningId = 0;
    var isWinPossible = true;
    for (var y = 0; y < this.height && isWinPossible; ++y) {
      for (var x = 0; x < this.width && isWinPossible; ++x) {
        var cell = this.map[y][x][0];
        if (cell != this.NEUTRAL_CELL) {
          if (winningId == this.NEUTRAL_ID) {
            winningId = cell.getId();
          } else if (winningId != cell.getId()) {
            isWinPossible = false;
          }
        }
      }
    }

    if (isWinPossible) {
      console.log('The game has ended after ' + turns + ' turns.');
      if (winningId == this.NEUTRAL_ID) {
        console.log('Tie game!');
      } else {
        console.log('Bot ' + winningId + ' wins!');
      }
      return true;
    }
    return false;
  }

  cloneMap() {
    var dupedMap = new Array(this.height);
    for (var y = 0; y < this.height; ++y) {
      dupedMap[y] = new Array(this.width);
      for (var x = 0; x < this.width; ++x) {
        var cell = this.map[y][x][0];    // Map is guaranteed to have only 1 element in the cell.
        dupedMap[y][x] = new Cell(cell.getId(), cell.getCreature());
      }
    }
    return dupedMap;
  }

  takeDamage(cellToDamage, y, x) {
    y = (y + this.height) % this.height;
    x = (x + this.width) % this.width;
    var attackerCell = this.map[y][x][0];
    if (cellToDamage.getId() != attackerCell.getId()) {
      cellToDamage.takeDamage(attackerCell.getAttack());
    }
  }
}
