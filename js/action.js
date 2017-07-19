exports.Action = class Action {
  constructor(pos, move, face, amount) {
    this.x = pos.x;
    this.y = pos.y;
    this.move = move;
    this.face = face;
    this.amount = Math.round(amount);
  }

  getPosition() {
    return { x: this.pos.x, y: this.pos.y };
  }

  getMove() {
    return this.move;
  }

  getFace() {
    return this.face;
  }

  getAmount() {
    return this.amount;
  }
};
