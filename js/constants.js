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
FLOWER.src = 'images/flower.png';
const POTENT_FLOWER = new Image();
POTENT_FLOWER.src = 'images/potentFlower.png';
const BEES = [new Image(), new Image()];
const QUEEN_BEES = [new Image(), new Image()];
for (let i = 0; i < 2; ++i) {
  BEES[i].src = 'images/bee' + (i + 1) + '.png';
  QUEEN_BEES[i].src = 'images/queen' + (i + 1) + '.png';
}

const MAX_TURNS = 20;
const ANIMATION_TIME = 500;
const PAUSE_TIME = 200;
const GRID_COLOUR = '#E4E4E4';
const TEXT_COLOUR = '#E4E4E4';
