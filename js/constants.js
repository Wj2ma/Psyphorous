const Move = {
  STAY: 0,
  UP: 1,
  RIGHT: 2,
  DOWN: 3,
  LEFT: 4
};

const Face = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3,
};

// Note that the order matters. The higher the number will take precedence if there is an ally conflict.
const InsectType = {
  BEE: 0,
  WASP: 1,
  QUEENBEE: 2
};

const Flower = {
  NONE: 0,
  REGULAR: 1,
  POTENT: 2
};

const KILL_PRIORITY = [ InsectType.WASP, InsectType.BEE, InsectType.QUEENBEE ];

const FLOWER = new Image();
FLOWER.src = "images/flower.png";
const POTENT_FLOWER = new Image();
POTENT_FLOWER.src = "images/potentFlower.png";
