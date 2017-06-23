exports.Move = {
  STAY: 0,
  UP: 1,
  RIGHT: 2,
  DOWN: 3,
  LEFT: 4
};

exports.Face = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3,
};

// Note that the order matters. The higher the number will take precedence if there is an ally conflict.
exports.InsectType = {
  BEE: 0,
  WASP: 1,
  QUEENBEE: 2
};

exports.Flower = {
  NONE: 0,
  REGULAR: 1,
  POTENT: 2
};

exports.KILL_PRIORITY = [ exports.InsectType.WASP, exports.InsectType.BEE, exports.InsectType.QUEENBEE ];

exports.MAX_TURNS = 20;
