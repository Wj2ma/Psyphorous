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
        let cell = map[y][x];
        if (cell.getBotId() == this.id) {
          moves.push(new Action(x, y, Math.floor(Math.random() * 5)));
        }
      }
    }
    return moves;
  }
}

class RandomBot2 extends Bot {
  computeNextMove(map) {
    let moves = [];
    let availMoves = [Move.STAY, Move.UP, Move.DOWN];
    for (let y = 0; y < map.length; ++y) {
      for (let x = 0; x < map[y].length; ++x) {
        let cell = map[y][x];
        if (cell.getBotId() == this.id) {
          moves.push(new Action(x, y, availMoves[Math.floor(Math.random() * 3)]));
        }
      }
    }
    return moves;
  }
}

class UpDownBot extends Bot {
  constructor(move) {
    super();
    this.move = move;
  }

  computeNextMove(map) {
    let moves = [];
    for (let y = 0; y < map.length; ++y) {
      for (let x = 0; x < map[y].length; ++x) {
        let cell = map[y][x];
        if (cell.getBotId() == this.id) {
          moves.push(new Action(x, y, this.move));
        }
      }
    }
    return moves;
  }
}

class UpDownBot2 extends Bot {
  constructor(move) {
    super();
    this.turn = 0;
    this.move = move;
  }

  computeNextMove(map) {
    let moves = [];
    for (let y = 0; y < map.length; ++y) {
      for (let x = 0; x < map[y].length; ++x) {
        let cell = map[y][x];
        if (cell.getBotId() == this.id) {
          moves.push(new Action(x, y, this.turn == 0 && x % 2 == 0 ? Move.STAY : this.move));
        }
      }
    }
    ++this.turn;
    return moves;
  }
}

const Move = {
  STAY: 0,
  UP: 1,
  RIGHT: 2,
  DOWN: 3,
  LEFT: 4
};

class Creature {
  constructor(id) {
    this.id = id;
  }

  getId() {
    return this.id;
  }

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
  constructor(id) {
    super(id);
    this.attack = 2;
    this.hp = 3;
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
  constructor(botId, creature) {
    this.botId = botId;
    this.creature = creature;
  }

  getCreatureId() {
    return this.creature.getId();
  }

  getBotId() {
    return this.botId;
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

const NEUTRAL_ID = 0;
const NEUTRAL_CELL = new Cell(NEUTRAL_ID, null);

class Game {
  constructor(bots, width, height) {
    this.bots = bots;
    this.width = width;
    this.height = height;

    let initErrors = false;
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

    for (let i = 0; i < bots.length; ++i) {
      this.bots[i].init(i + 1);
    }

    let creatureIds = 0;
    (this.map = []).length = height;
    for (let y = 0; y < height; ++y) {
      (this.map[y] = []).length = width;
      for (let x = 0; x < width; ++x) {
        // TODO: This part is hardcoded to 2 bots and set locations. Need to change later.
        if (y == 1 && x >= 1 && x <= width - 2) {
          this.map[y][x] = [new Cell(bots[0].getId(), new Skeleton(creatureIds++))];
        } else if (y == height - 2 && x >= 1 && x <= width - 2) {
          this.map[y][x] = [new Cell(bots[1].getId(), new Skeleton(creatureIds++))];
        } else {
          this.map[y][x] = [NEUTRAL_CELL];
        }
      }
    }

    this.canvas = new Canvas(width, height);

    this.runGame();
  }

  runGame() {
    let turns = 0;
    let gameEnded = false;
    let game = this;
    let dupedMap = game.cloneMap();
    this.canvas.drawFinalMap(dupedMap);
    let turn = function() {
      if (turns >= 10 * Math.sqrt(game.width * game.height) || gameEnded) {
        // Max turns reached. Winner will be determined by sum of hp and attack they have.
        if (!gameEnded) {
          let botPoints = [];
          botPoints.length = game.bots.length;
          botPoints.fill(0);
          for (let y = 0; y < game.height; ++y) {
            for (let x = 0; x < game.width; ++x) {
              let cell = game.map[y][x][0];
              botPoints[cell.getBotId() - 1] += cell.getAttack() + cell.getLife();
            }
          }

          console.log('The game has ended after ' + turns + ' turns. Here are the following scores:');
          let winners = [];
          let maxPoints = 0;
          for (let i = 0; i < botPoints.length; ++i) {
            console.log('Bot ' + game.bots[i].getId() + ' scored ' + botPoints[i] + ' points!');
            if (maxPoints < botPoints[i]) {
              winners = [game.bots[i].getId()];
              maxPoints = botPoints[i];
            } else if (maxPoints == botPoints[i]) {
              winners.push(game.bots[i].getId());
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
          botsActions.push(game.bots[i].computeNextMove(dupedMap));
        }

        game.updateMap(botsActions, dupedMap);
        game.resolveConflicts();
        game.computeDamages();
        game.removeTheDead();
        gameEnded = game.didGameEnd(++turns);

        let updatedMap = game.cloneMap();
        game.canvas.animate(dupedMap, updatedMap, turn);
        dupedMap = updatedMap;
      }
    };

    setTimeout(turn, 500);
  }

  // Aggregate all the actions into the map.
  updateMap(botsActions, dupedMap) {
    this.canvas.resetAnimations();

    for (let i = 0; i < this.bots.length; ++i) {
      let bot = this.bots[i];
      let botActions = botsActions[i];
      for (let j = 0; j < botActions.length; ++j) {
        let action = botActions[j];
        let x = action.getX();
        let y = action.getY();
        let cell = dupedMap[y][x];
        if (cell.getBotId() == bot.getId()) {
          switch (action.getMove()) {
            case Move.UP:
              this.map[(this.height + y - 1) % this.height][x].push(this.map[y][x].shift());
              this.canvas.pushAnimation(cell, x, y, Move.UP);
              break;
            case Move.RIGHT:
              this.map[y][(x + 1) % this.width].push(this.map[y][x].shift());
              this.canvas.pushAnimation(cell, x, y, Move.RIGHT);
              break;
            case Move.DOWN:
              this.map[(y + 1) % this.height][x].push(this.map[y][x].shift());
              this.canvas.pushAnimation(cell, x, y, Move.DOWN);
              break;
            case Move.LEFT:
              this.map[y][(this.width + x - 1) % this.width].push(this.map[y][x].shift());
              this.canvas.pushAnimation(cell, x, y, Move.LEFT);
              break;
          }
        } // Else invalid action.
      }
    }


  }

  // Reduce all conflicting squares (more than one cell in that square).
  // Also add a neutral cell to empty squares.
  resolveConflicts() {
    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        let cells = this.map[y][x].filter(cell => cell != NEUTRAL_CELL);
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Test Rule #1:
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Everyone takes damage from everyone until there is a last man standing, or everyone dies.
        // while (cells.length > 1) {
        //   for (let cellToDamage of cells) {
        //     for (let attackerCell of cells) {
        //       if (cellToDamage != attackerCell) {
        //         cellToDamage.takeDamage(attackerCell.getAttack());
        //       }
        //     }
        //   }
        //   cells = cells.filter(function(cell) {
        //     return cell.getLife() > 0;
        //   });
        // }
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Test Rule #2:
        // The creature with the highest hp wins regardless of damage. It's hp will be subtracted from the second
        // highest creature's hp.
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        if (cells.length > 1) {
          let healthiestCreature = null;
          let secondHealthiest = null;
          for (let cell of cells) {
            if (healthiestCreature == null) {
              healthiestCreature = cell;
            } else if (healthiestCreature.getLife() <= cell.getLife()) {
              secondHealthiest = healthiestCreature;
              healthiestCreature = cell;
            } else if (secondHealthiest == null || secondHealthiest.getLife() < cell.getLife()) {
              secondHealthiest = cell;
            }
          }

          if (healthiestCreature.getLife() == secondHealthiest.getLife()) {
            cells = [NEUTRAL_CELL];
          } else {
            healthiestCreature.takeDamage(secondHealthiest.getLife());
            cells = [healthiestCreature];
          }
        }
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if (cells.length == 0) {
          cells.push(NEUTRAL_CELL);
        }

        // Reassign because cells could be a filtered version of the array.
        this.map[y][x] = cells;
      }
    }
  }

  // Take damage from all adjacent squares that do not have the same ID.
  computeDamages() {
    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        let cellToDamage = this.map[y][x][0];
        if (cellToDamage != NEUTRAL_CELL) {
          this.takeDamage(cellToDamage, y + 1, x - 1);
          this.takeDamage(cellToDamage, y + 1, x);
          this.takeDamage(cellToDamage, y + 1, x + 1);
          this.takeDamage(cellToDamage, y - 1, x - 1);
          this.takeDamage(cellToDamage, y - 1, x);
          this.takeDamage(cellToDamage, y - 1, x + 1);
          this.takeDamage(cellToDamage, y, x - 1);
          this.takeDamage(cellToDamage, y, x + 1);
        }
      }
    }
  }

  removeTheDead() {
    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        let cell = this.map[y][x][0];
        if (cell != NEUTRAL_CELL && cell.getLife() <= 0) {
          this.map[y][x].shift();
          this.map[y][x].push(NEUTRAL_CELL);
        }
      }
    }
  }

  didGameEnd(turns) {
    let winningId = 0;
    let isWinPossible = true;
    for (let y = 0; y < this.height && isWinPossible; ++y) {
      for (let x = 0; x < this.width && isWinPossible; ++x) {
        let cell = this.map[y][x][0];
        if (cell != NEUTRAL_CELL) {
          if (winningId == NEUTRAL_ID) {
            winningId = cell.getBotId();
          } else if (winningId != cell.getBotId()) {
            isWinPossible = false;
          }
        }
      }
    }

    if (isWinPossible) {
      console.log('The game has ended after ' + turns + ' turns.');
      if (winningId == NEUTRAL_ID) {
        console.log('Tie game!');
      } else {
        console.log('Bot ' + winningId + ' wins!');
      }
      return true;
    }
    return false;
  }

  cloneMap() {
    let dupedMap = new Array(this.height);
    for (let y = 0; y < this.height; ++y) {
      dupedMap[y] = new Array(this.width);
      for (let x = 0; x < this.width; ++x) {
        let cell = this.map[y][x][0];    // Map is guaranteed to have only 1 element in the cell.
        if (cell == NEUTRAL_CELL) {
          dupedMap[y][x] = NEUTRAL_CELL;
        } else {
          dupedMap[y][x] = new Cell(cell.getBotId(), cell.getCreature());
        }
      }
    }
    return dupedMap;
  }

  takeDamage(cellToDamage, y, x) {
    y = (y + this.height) % this.height;
    x = (x + this.width) % this.width;
    let attackerCell = this.map[y][x][0];
    if (cellToDamage.getBotId() != attackerCell.getBotId()) {
      cellToDamage.takeDamage(attackerCell.getAttack());
    }
  }
}

class Canvas {
  constructor(width, height) {
    let canvas = document.getElementById('game');
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = canvas.getContext('2d');
    this.xStep = canvas.width / width;
    this.yStep = canvas.height / height;
    this.creatureSize = Math.min(this.xStep / 3, this.yStep / 3);
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
      this.ctx.lineTo(x, 400);
    }
    for (let y = this.yStep; y < this.height; y += this.yStep) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(400, y);
    }
    this.ctx.stroke();
  }

  resetAnimations() {
    this.animations = new Map();
  }

  pushAnimation(cell, x, y, move) {
    this.animations.set(cell.getCreatureId(), {
      botId: cell.getBotId(),
      hp: cell.getLife(),
      x: this.mapXCoordToPixels(x),
      y: this.mapYCoordToPixels(y),
      move
    });
  }

  animate(map, finalMap, callback) {
    let lastAnimationTime = (new Date()).getTime();
    let totalTime = 0;
    let canvas = this;
    let stillCreatures = [];

    for (let y = 0; y < map.length; ++y) {
      for (let x = 0; x < map[y].length; ++x) {
        let cell = map[y][x];
        if (cell != NEUTRAL_CELL && !this.animations.has(cell.getCreatureId())) {
          stillCreatures.push({
            botId: cell.getBotId(),
            hp: cell.getLife(),
            x: this.mapXCoordToPixels(x),
            y: this.mapYCoordToPixels(y)
          });
        }
      }
    }

    let animateFrame = function() {
      let callTime = (new Date()).getTime();
      let elapsedTime = callTime - lastAnimationTime;
      totalTime += elapsedTime;
      lastAnimationTime = callTime;
      canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.drawGrid();

      for (let stillCreature of stillCreatures) {
        let colour = canvas.getColour(stillCreature.botId);
        canvas.drawCreature(stillCreature.x, stillCreature.y, colour, stillCreature.hp);
      }

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

        let colour = canvas.getColour(an.botId);

        // Main creature.
        canvas.drawCreature(an.x, an.y, colour, an.hp);

        // If creatures are to be wrapped around, draw the same creature on the other end.
        if (an.x > canvas.width - canvas.creatureSize) {
          canvas.drawCreature(an.x - canvas.width, an.y, colour, an.hp);
        } else if (an.x < canvas.creatureSize) {
          canvas.drawCreature(an.x + canvas.width, an.y, colour, an.hp);
        }

        if (an.y > canvas.height - canvas.creatureSize) {
          canvas.drawCreature(an.x, an.y - canvas.height, colour, an.hp);
        } else if (an.y < canvas.creatureSize) {
          canvas.drawCreature(an.x, an.y + canvas.height, colour, an.hp);
        }
      }

      if (totalTime < 500) {
        requestAnimationFrame(animateFrame);
      } else {
        canvas.drawFinalMap(finalMap);
        setTimeout(callback, 500);
      }
    };

    requestAnimationFrame(animateFrame);
  }

  getColour(botId) {
    // TODO: This part is hardcoded to 2 bots.
    switch (botId) {
      case 1:
        return '#FF0030';
      case 2:
        return '#0032FF';
    }
  }

  drawCreature(x, y, colour, hp) {
    this.ctx.fillStyle = colour;
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.creatureSize, 0, 2 * Math.PI);
    this.ctx.fill();

    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#E4E4E4';
    this.ctx.fillText(hp, x - 5, y + 6);
  }

  drawFinalMap(map) {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.drawGrid();

    for (let y = 0; y < map.length; ++y) {
      for (let x = 0; x < map[y].length; ++x) {
        let cell = map[y][x];
        if (cell.getBotId() != 0) {
          this.drawCreature(
            this.mapXCoordToPixels(x),
            this.mapYCoordToPixels(y),
            this.getColour(cell.getBotId()),
            cell.getLife()
          );
        }
      }
    }
  }
}
