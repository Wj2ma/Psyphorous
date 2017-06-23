exports.Action = class Action {
  constructor(x, y, move, face, amount) {
    this.x = x;
    this.y = y;
    this.move = move;
    this.face = face;
    this.amount = Math.round(amount);
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

  getFace() {
    return this.face;
  }

  getAmount() {
    return this.amount;
  }
};
