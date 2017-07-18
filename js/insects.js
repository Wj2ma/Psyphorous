let C = require('./constants.js');

exports.Insect = class Insect {
  constructor(id, botId, pos, face) {
    this.id = id;
    this.botId = botId;
    this.count = 1;
    this.face = face || C.Face.UP;
    this.pollen = 0;
    this.type = -1;
    this.pos = pos;
  }

  getId() {
    return this.id;
  }

  getBotId() {
    return this.botId;
  }

  getAttack() {
    return 0;
  }

  getCount() {
    return this.count;
  }

  getPollen() {
    return this.pollen;
  }

  getFace() {
    return this.face;
  }

  getType() {
    return this.type;
  }

  getKillAmount() {
    return this.count;
  }

  getPosition() {
    return { x: this.pos.x, y: this.pos.y };
  }
};

exports.QueenBee = class QueenBee extends exports.Insect {
  constructor(id, botId, pos, face, count, pollen) {
    super(id, botId, pos, face);
    this.count = count || this.count;
    this.pollen = pollen || this.pollen;
    this.type = C.InsectType.QUEENBEE;
  }

  getAttack() {
    return 9001;
  }

  getKillAmount() {
    return 0;
  }
};

exports.Bee = class Bee extends exports.Insect {
  constructor(id, botId, pos, face, count, pollen) {
    super(id, botId, pos, face);
    this.count = count || this.count;
    this.pollen = pollen || this.pollen;
    this.type = C.InsectType.BEE;
  }

  getAttack() {
    return this.count;
  }
};

exports.Wasp = class Wasp extends exports.Insect {
  constructor(id, botId, pos, face, count) {
    super(id, botId, pos, face);
    this.count = count;
    this.type = C.InsectType.WASP;
    this.count = count || this.count;
  }

  getAttack() {
    return this.count * 2;
  }

  getKillAmount() {
    return this.count * 2;
  }
};
