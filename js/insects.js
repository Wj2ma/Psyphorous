class Insect {
  constructor(id, botId, face) {
    this.id = id;
    this.botId = botId;
    this.count = 1;
    this.face = face || Face.UP;
    this.pollen = 0;
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

  // Split 'amount' insects off from this group. E.g. The splitted off will be moving to a different cell.
  splitOff(amount) {
    this.count -= amount;
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
}

class QueenBee extends Insect {
  constructor(id, botId, face) {
    super(id, botId, face);
  }

  getType() {
    return InsectType.QUEENBEE;
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
}

class Bee extends Insect {
  constructor(id, botId, face, amount) {
    super(id, botId, face);
    this.count = amount || this.count;
  }

  getType() {
    return InsectType.BEE;
  }

  getAttack() {
    return this.count;
  }

  collectPollen(amount) {
    this.pollen = Math.max(this.count * 3, this.pollen + amount);
  }

  depositPollen() {
    let amount = this.pollen;
    this.pollen = 0;
    return amount;
  }
}

class Wasp extends Insect {
  constructor(id, botId, face, count) {
    super(id, botId, face);
    this.count = count;
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
}
