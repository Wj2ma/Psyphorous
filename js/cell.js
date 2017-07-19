exports.Cell =  class Cell {
  constructor(pos, potency, insect) {
    this.potency = potency;
    this.insect = insect;
    this.pos = pos;
  }

  getInsect() {
    return this.insect;
  }

  getPotency() {
    return this.potency;
  }

  getPosition() {
    return { x: this.pos.x, y: this.pos.y };
  }

  clearInsect() {
    this.insect = null;
  }

  setInsect(insect) {
    this.insect = insect;
  }
};
