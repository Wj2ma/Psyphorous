let C = require('./constants.js');

exports.Insect = class Insect {
  constructor(id, botId, face) {
    this.id = id;
    this.botId = botId;
    this.count = 1;
    this.face = face || C.Face.UP;
    this.pollen = 0;
    this.type = -1;
  }

  getReplayData() {
    return { i: this.botId, c: this.count, f: this.face, p: this.pollen, t: this.type };
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

  addCount(amount) {
    this.count = Math.min(100, this.count + amount);
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

  // Split 'amount' insects off from this group. E.g. The splitted off will be moving to a different cell.
  splitOff(amount) {
    let pollenToGive = Math.round(this.pollen * amount / this.count);
    this.count -= amount;
    this.pollen -= pollenToGive;
    return pollenToGive;
  }

  takeDamage(damage) {
    this.count -= damage;
  }

  getKillAmount() {
    return this.count;
  }

  changeFace(face) {
    this.face = face;
  }

  // Default action is do nothing.
  collectPollen(amount) {

  }

  addPollen(amount) {
    this.pollen += amount;
  }
};

exports.QueenBee = class QueenBee extends exports.Insect {
  constructor(id, botId, face) {
    super(id, botId, face);
    this.type = C.InsectType.QUEENBEE;
  }

  getAttack() {
    return 9001;
  }

  takeDamage(damage) {
    this.pollen -= damage * 10;
  }

  takePollen(amount) {
    this.pollen += amount;
  }

  getKillAmount() {
    return 0;
  }

  spawnBees() {
    let bees = Math.floor(this.pollen / 5);
    this.pollen %= 5;
    return bees;
  }
};

exports.Bee = class Bee extends exports.Insect {
  constructor(id, botId, face, amount, pollen) {
    super(id, botId, face);
    this.count = amount || this.count;
    this.pollen = pollen || this.pollen;
    this.type = C.InsectType.BEE;
  }

  getAttack() {
    return this.count;
  }

  collectPollen(amount) {
    this.pollen = Math.min(this.count * 3, this.pollen + this.count * amount);
  }

  depositPollen() {
    let amount = this.pollen;
    this.pollen = 0;
    return amount;
  }
};

exports.Wasp = class Wasp extends exports.Insect {
  constructor(id, botId, face, count) {
    super(id, botId, face);
    this.count = count;
    this.type = C.InsectType.WASP;
  }

  getAttack() {
    return this.count * 2;
  }

  takeDamage(damage) {
    this.count -= Math.floor(damage / 2);
  }

  getKillAmount() {
    return this.count * 2;
  }
};
