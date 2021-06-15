/* eslint-disable no-unused-vars */
"use strict";

// eslint-disable-next-line prefer-const
let spriteTypes = {};

const SHAPES = {
  BOX: 1,
  SLOPE_LEFT: 2,
  SLOPE_RIGHT: 3,
  CIRCLE: 4,
  TOP_DOWN: 5,
  SLOPING_CEILING_LEFT: 6,
  SLOPING_CEILING_RIGHT: 7,
  SHADING: 8,
};

const DIRECTION = {
  MIDDLE: 0,
  UP: 1,
  TOP: 1,
  RIGHT: 2,
  BOTTOM: 3,
  DOWN: 3,
  LEFT: 4,
};

const LAYERS = {
  BACKGROUND: 1,
  MIDDLE: 2,
  FOREGROUND: 3,
};

const tileMaterials = {
  default: {
    id: "default",
    name: "Clay",
    inertia: 0.95,
  },
  ice: {
    id: "ice",
    name: "Ice",
    inertia: 0.99,
  },
};

const DAMAGE_TYPES = {
  COLLECT: 0,
  EAT: 1,
  TOUCH: 2,
  SPIKE: 3,
  FIRE: 4,
  SPOOK: 5,
  BITE: 6,
};

const ROLES = {
  NEUTRAL: 0,
  FRIEND: 1,
  ENEMY: 2,
  ITEM: 3,
};

class Scene {
  constructor({
    id = generateId(),
    version = "1.0",
    title = "Untitled",
    author = "",
    created = new Date().toISOString(),
    lastEdit = new Date().toISOString(),
    bgColor = "#f0f0ff",
    captions = [{ text: "Are you ready?", y: 0.5, delay: 1000 }],
    endCaption = "Bliss!",
    left = 0,
    top = 0,
    right = 800,
    bottom = 600,
    horizontalLoop = true,
    verticalLoop = true,
    sprites = [],
    tiles = [],
    effects = [],
    themeSong = "theme-punk-1",
    actionDifficulty = 0.5,
    puzzleDifficulty = 0.5,
  }) {
    this.id = id;
    this.version = version;
    this.created = created;
    this.lastEdit = lastEdit;
    this.title = title;
    this.author = author;
    this.bgColor = bgColor;
    this.themeSong = themeSong;
    this.captions = captions;
    this.endCaption = endCaption;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    this.left = left;
    this.horizontalLoop = horizontalLoop;
    this.verticalLoop = verticalLoop;
    this.effects = effects;
    this.actionDifficulty = actionDifficulty;
    this.puzzleDifficulty = puzzleDifficulty;
    this.sprites = sprites;
    this.tiles = tiles.map((tile) => new Tile(tile));
  }

  get width() {
    return this.right - this.left;
  }

  get height() {
    return this.bottom - this.top;
  }
}

class Camera {
  constructor({ enabled = true, x = 0, y = 0 }) {
    this.enabled = enabled;
    this.x = x;
    this.y = y;
  }

  get pixelX() {
    return Math.floor(this.x);
  }

  get pixelY() {
    return Math.floor(this.y);
  }
}

class SpriteType {
  constructor({
    id,
    name,
    shape = SHAPES.BOX,
    resizable = true,
    collectable = false,
    spriteProps = {},
    collidesWithObstacles = true,
    collisidesWithSprites = true,
    movedByOtherSprites = true,
    collisionBox,
    collisionBoxes,
    paths = {},
    patterns,
    behaviours = [],
    damage = 0,
    isDamagedBy,
    isNotDamagedBy,
    damageType = DAMAGE_TYPES.TOUCH,
    attackAnimation,
    animations = { idle: [{ frame: "default" }] },
    frames,
    shaded = true,
    availableInEditor = true,
    colors,
    dyingEffect,
    removable = true,
  }) {
    this.id = id;
    this.name = name;
    this.shape = shape;
    this.resizable = resizable;
    this.collectable = collectable;
    this.spriteProps = spriteProps;
    this.collidesWithObstacles = collidesWithObstacles;
    this.collisidesWithSprites = collisidesWithSprites;
    this.movedByOtherSprites = movedByOtherSprites;
    this.damage = damage;
    this.damageType = damageType;
    this.attackAnimation = attackAnimation;
    this.shaded = shaded;
    this.colors = colors;
    this.animations = animations;
    this.availableInEditor = availableInEditor;
    this.dyingEffect = dyingEffect;
    this.removable = removable;

    if (isDamagedBy) {
      this.isDamagedBy = isDamagedBy;
    } else if (isNotDamagedBy) {
      this.isDamagedBy = Object.values(DAMAGE_TYPES).filter(
        (type) => !isNotDamagedBy.includes(type)
      );
    } else {
      this.isDamagedBy = Object.values(DAMAGE_TYPES);
    }

    if (frames) {
      this.frames = frames;
    } else {
      this.frames = { default: [] };
      for (const i in paths) {
        this.frames.default.push({ path: i });
      }
    }
    this.paths = paths;

    if (patterns) {
      this.patterns = { ...patterns };
    } else {
      this.patterns = {
        default: {
          behaviours: [...behaviours],
        },
      };
    }

    if (this.patterns.dead) {
      this.removable = false;
    }

    if (collisionBox) {
      this.collisionBoxes = [new CollisionBox(collisionBox)];
    } else if (collisionBoxes) {
      this.collisionBoxes = collisionBoxes.map((box) => new CollisionBox(box));
    } else {
      this.collisionBoxes = [new CollisionBox({ shape })];
    }
  }

  init(sprite) {
    for (const i in this.spriteProps) {
      sprite[i] = this.spriteProps[i];
    }

    for (const pattern in this.patterns) {
      this.patterns[pattern].behaviours.forEach((behaviour) => {
        if (behaviour.init) {
          behaviour.init(sprite);
        }
      });
    }

    if (this.colors && !sprite.color) {
      sprite.color = this.colors[
        Math.floor(Math.random() * this.colors.length)
      ];
    }

    return sprite;
  }

  behave(params) {
    this.patterns[params.sprite.pattern].behaviours.forEach((behaviour) => {
      behaviour.do(params);
    });

    if (
      params.sprite.health > 0 &&
      this.patterns[params.sprite.pattern].next &&
      this.patterns[params.sprite.pattern].rounds > 0
    ) {
      params.sprite.patternCounter++;
      if (
        params.sprite.patternCounter >
        this.patterns[params.sprite.pattern].rounds
      ) {
        params.sprite.changePattern(this.patterns[params.sprite.pattern].next);
      }
    }
  }

  toJSON() {
    const data = { ...this };
    if (data.shape === SHAPES.BOX) {
      data.shape = undefined;
    }
    if (
      data.collisionBoxes.length === 1 &&
      data.collisionBoxes[0].t === 0 &&
      data.collisionBoxes[0].l === 0 &&
      data.collisionBoxes[0].r === 1 &&
      data.collisionBoxes[0].b === 1
    ) {
      data.collisionBoxes = undefined;
    }

    return data;
  }
}

// eslint-disable-next-line no-unused-vars
class Sprite {
  constructor({
    id,
    typeId,
    parentId,
    isPlayer = false,
    role = ROLES.NEUTRAL,
    isObstacle = false,
    isStatic = false,
    direction = DIRECTION.RIGHT,
    width = 0,
    height = 0,
    x = 0,
    y = 0,
    weight = 0.25,
    maxVelocity = { x: 2, y: 6 },
    velocity = { x: 0, y: 0 },
    health = 1,
    color,
    hidden = false,
    pattern = "default",
  }) {
    this.id = id || generateId();
    this.parentId = parentId;
    this.isPlayer = isPlayer;
    this.role = role;
    this.isObstacle = isObstacle;
    this.isStatic = isStatic;
    this.direction = direction;
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.weight = weight;
    this.maxVelocity = { ...maxVelocity };
    this.velocity = { ...velocity };
    this.health = health;
    this.healthChange = 0;
    this.freezeCounter = 0;
    this.color = color;
    this.hidden = hidden;
    this.damageCounter = 0;
    this.nextAnimation = undefined;
    this.animationMinDuration = 0;

    this.setType(typeId);

    this.changePattern(pattern);

    if (this.animation === undefined) {
      this.changeAnimation({ animation: "idle", randomFrame: true });
    }

    this.resetCollisionData();
    this.resetCollisionBoxes();
  }

  changeAnimation({
    animation,
    randomFrame = false,
    forceChange = false,
    animationMinDuration = 0,
  }) {
    if (this.animation === animation) {
      if (this.animationMinDuration !== undefined) {
        this.animationMinDuration += animationMinDuration;
      }

      if (!forceChange) {
        return;
      }
    }

    if (
      this.animationMinDuration === undefined ||
      this.animationMinDuration < Date.now()
    ) {
      this.setAnimation(animation, randomFrame, animationMinDuration);
    } else {
      this.nextAnimation = {
        animation,
        randomFrame,
        animationMinDuration,
      };
    }
  }

  setAnimation(name, randomFrame = false, animationMinDuration = 0) {
    if (spriteTypes[this.typeId].animations[name]) {
      this.animation = name;
      this.frame = randomFrame
        ? Math.floor(
            Math.random() * spriteTypes[this.typeId].animations[name].length
          )
        : 0;
      this.animationMinDuration = Date.now() + animationMinDuration;
      this.frameCounter = 0;
    }
  }

  animate(rps = 90) {
    if (this.nextAnimation && Date.now() > this.animationMinDuration) {
      this.setAnimation(
        this.nextAnimation.animation,
        this.nextAnimation.randomFrame,
        this.nextAnimation.animationMinDuration
      );
      this.nextAnimation = undefined;
    }

    const animation =
      spriteTypes[this.typeId].animations[this.animation] ||
      spriteTypes[this.typeId].animations.idle;

    if (animation && animation.length > 1) {
      const frame = animation[this.frame] || { s: 0 };

      if (this.frameCounter >= rps * (frame.s || 0)) {
        if (this.frame + 1 < animation.length) {
          this.frame++;
        } else if (frame.loop !== undefined) {
          this.frame = frame.loop;
        }
        this.frameCounter = 0;
      } else {
        this.frameCounter++;
      }
    }
  }

  setType(typeId) {
    this.typeId = typeId;
    if (spriteTypes[typeId]) {
      spriteTypes[typeId].init(this);
      this.changePattern("default");
      this.changeAnimation({ animation: "idle", randomFrame: true });
    } else {
      console.error(`Sprite type ${typeId} not found for sprite ${this.id}`);
    }
  }

  changePattern(patternName) {
    if (this.pattern !== patternName) {
      if (spriteTypes[this.typeId].patterns[patternName]) {
        this.pattern = patternName;
        // this.color = spriteTypes[this.typeId].patterns[pattern].color || this.color;
        for (const prop in spriteTypes[this.typeId].patterns[this.pattern]
          .spriteProps) {
          this[prop] =
            spriteTypes[this.typeId].patterns[this.pattern].spriteProps[prop];
        }

        if (spriteTypes[this.typeId].patterns[this.pattern].animation) {
          this.changeAnimation({
            animation:
              spriteTypes[this.typeId].patterns[this.pattern].animation,
            animationMinDuration: 200,
          });
        }

        this.patternCounter = 0;
      } else {
        this.pattern = "default";
        console.error(`No pattern ${patternName} in type ${this.typeId}`);
      }
    }
  }

  resetCollisionData() {
    this.collisionData = {
      left: false,
      right: false,
      bottom: false,
      top: false,
      bounce: false,
      boxes: [],
      damage: 0,
      yChange: 0,
      xChange: 0,
      width: this.width,
      height: this.height,
      spriteIds: new Set(),
      enemyHits: 0,
      playerHits: 0,
      wallHits: 0,
      tileIds: new Set(),
      velocity: { ...this.velocity },
    };
  }

  resetCollisionBoxes(scene) {
    const type = spriteTypes[this.typeId];

    this.collisionData.boxes = type.collisionBoxes.map((box) => {
      return {
        shape: box.shape || type.shape || SHAPES.BOX,
        testSprites: box.testSprites,
        testTiles: box.testTiles,
        t: this.y + Math.floor(this.height * box.t),
        r: this.x + this.width * box.r,
        b: this.y + Math.floor(this.height * box.b),
        l: this.x + this.width * box.l,
      };
    });

    if (scene) {
      this.collisionData.boxes.forEach((box) => {
        if (scene.horizontalLoop) {
          if (box.r >= scene.right) {
            this.collisionData.boxes.push({
              shape: box.shape,
              testSprites: box.testSprites,
              testTiles: box.testTiles,
              t: box.t,
              r: box.r - scene.width,
              b: box.b,
              l: box.l - scene.width,
            });
          } else if (box.l <= scene.left) {
            this.collisionData.boxes.push({
              shape: box.shape,
              testSprites: box.testSprites,
              testTiles: box.testTiles,
              t: box.t,
              r: box.r + scene.width,
              b: box.b,
              l: box.l + scene.width,
            });
          }
        }
        if (scene.verticalLoop) {
          if (box.b >= scene.bottom) {
            this.collisionData.boxes.push({
              shape: box.shape,
              testSprites: box.testSprites,
              testTiles: box.testTiles,
              t: box.t - scene.height,
              r: box.r,
              b: box.b - scene.height,
              l: box.l,
            });
          } else if (box.t <= scene.top) {
            this.collisionData.boxes.push({
              shape: box.shape,
              testSprites: box.testSprites,
              testTiles: box.testTiles,
              t: box.t + scene.height,
              r: box.r,
              b: box.b + scene.height,
              l: box.l,
            });
          }
        }
      });
    }
  }

  // duckface hits cheeks
  // duckface hits pill
  // cheek hits pill
  // fireball hits pill
  // elevator hits pill
  // zombie hits living stone
  // fireball hits duckface

  isDamagedBy(sprite) {
    if (this.typeId === sprite.typeId) {
      return false;
    }

    if (this.id === sprite.parentId) {
      return false;
    }

    if (this.role === ROLES.FRIEND && sprite.role !== ROLES.ENEMY) {
      return false;
    }

    if (this.role === ROLES.NEUTRAL && sprite.role !== ROLES.ENEMY) {
      return false;
    }

    if (
      !spriteTypes[this.typeId].isDamagedBy.includes(
        spriteTypes[sprite.typeId].damageType
      )
    ) {
      return false;
    }

    return true;
  }

  get isSprite() {
    return true;
  }
}

class CollisionBox {
  constructor({
    shape = SHAPES.BOX,
    testSprites = true,
    testTiles = true,
    t = 0,
    r = 1,
    b = 1,
    l = 0,
  }) {
    this.shape = shape;
    this.testTiles = testTiles;
    this.testSprites = testSprites;
    this.t = t;
    this.r = r;
    this.b = b;
    this.l = l;
  }
}

class TileType {
  constructor({ inertia = 0 }) {
    this.inertia = inertia;
  }
}

class Tile {
  constructor({
    id,
    shape = SHAPES.BOX,
    color = "#b08080",
    stroke = "#383838",
    opacity = 1.0,
    transparent = false,
    x = 0,
    y = 0,
    z = 0,
    width = 0,
    height = 0,
    layer = LAYERS.MIDDLE,
    blocks = true,
    materialId = "default",
    borders = { t: true, r: true, b: true, l: true },
  }) {
    this.id = id;
    this.shape = shape;
    this.color = color;
    this.stroke = stroke;
    this.opacity = opacity;
    this.transparent = transparent;
    this.x = x;
    this.y = y;
    this.z = z;
    this.width = width;
    this.height = height;
    this.layer = layer;
    this.blocks = blocks;
    this.materialId = materialId;
    this.borders = { ...borders };
  }

  get isTile() {
    return true;
  }

  get isObstacle() {
    return true;
  }

  get isSlope() {
    return (
      this.shape === SHAPES.SLOPE_LEFT || this.shape === SHAPES.SLOPE_RIGHT
    );
  }

  get isTopDown() {
    return (
      this.borders.t && !this.borders.r && !this.borders.b && !this.borders.l
    );
  }

  get hasBorders() {
    return this.borders.t || this.borders.r || this.borders.b || this.borders.l;
  }

  get t() {
    return this.y;
  }

  get r() {
    return this.x + this.width;
  }

  get b() {
    return this.y + this.height;
  }

  get l() {
    return this.x;
  }

  toJSON() {
    const data = { ...this };

    if (data.shape === SHAPES.BOX) {
      data.shape = undefined;
    }

    if (data.blocks === true) {
      data.blocks = undefined;
    }

    if (data.stroke === "#383838") {
      data.stroke = undefined;
    }

    if (data.opacity === 1.0) {
      data.opacity = undefined;
    }

    if (data.transparent === false) {
      data.transparent = undefined;
    } else {
      data.color = undefined;
    }

    if (data.z === 0) {
      data.z = undefined;
    }

    if (data.layer === LAYERS.MIDDLE) {
      data.layer = undefined;
    }

    if (data.materialId === tileMaterials.default.id) {
      data.materialId = undefined;
    }

    if (data.borders.t && data.borders.r && data.borders.b && data.borders.l) {
      data.borders = undefined;
    }

    return data;
  }
}

class Particle {
  constructor({
    type,
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    weight = 0,
    duration = 1,
    rotation = 0,
    velocity = { x: 0, y: 0 },
    fill = "#ffffff",
    stroke = "#404040",
  }) {
    this.startTime = Date.now();
    this.type = type;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.weight = weight;
    this.duration = duration * 1000;
    this.rotation = rotation;
    this.velocity = { ...velocity };
    this.frame = 0;
    this.frameCounter = 0;
    this.fill = fill;
    this.stroke = stroke;
  }
}

function generateId() {
  return "xxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

class RandomValues {
  constructor(size = 50, scale = 1) {
    this.size = size;
    this.scale = scale;
    this.randomValues = new Array(size);
    this.index = 0;
    this.savedIndex = 0;
    this.recalculate();
  }

  recalculate() {
    for (let i = 0; i < this.size; i++) {
      this.randomValues[i] = (Math.random() - Math.random()) * this.scale;
    }
  }

  reset() {
    this.index = 0;
    this.savedIndex = 0;
  }

  x(x, y, r = 0) {
    return this.randomValues[Math.abs(x + y + r) % this.size];
  }

  y(x, y, r = 0) {
    return this.randomValues[Math.abs(x + y + r + 1) % this.size];
  }

  get nextValue() {
    this.index = (this.index + 1) % this.size;
    return this.randomValues[this.index];
  }

  save() {
    this.savedIndex = this.index;
  }

  restore() {
    this.index = this.savedIndex;
  }
}
// https://easings.net/
function easeInOutQuart(x) {
  return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
}

function easeOutExpo(x) {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

function easeInOutBack(x) {
  const c1 = 1.70158;
  const c2 = c1 * 1.525;

  return x < 0.5
    ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
    : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
}

function easeOutElastic(x) {
  const c4 = (2 * Math.PI) / 3;

  return x === 0
    ? 0
    : x === 1
    ? 1
    : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}

function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function easeOutQuint(x) {
  return 1 - Math.pow(1 - x, 5);
}

function jump2(x) {
  if (x >= 0.9) {
    return 0.1;
  }
  if (x >= 0.8) {
    return 0.2;
  }
  if (x >= 0.7) {
    return 0.4;
  }
  if (x >= 0.5) {
    return 0.8;
  }
  if (x >= 0.2) {
    return 1.0;
  } else {
    return 0.5;
  }
}

function easeJump(x) {
  if (x >= 0.9) {
    return 0.1;
  } else if (x >= 0.75) {
    return 0.25;
  } else if (x >= 0.5) {
    return 0.5;
  } else {
    return 1.0;
  }
}

function easeTransform(x) {
  if (x >= 1) {
    return 1;
  } else if (x >= 0.9) {
    return 1.5;
  } else if (x >= 0.8) {
    return 2.2;
  } else if (x >= 0.7) {
    return 1.5;
  } else if (x >= 0.6) {
    return 1.0;
  } else if (x >= 0.5) {
    return 0.6;
  } else if (x >= 0.4) {
    return 0.3;
  } else if (x >= 0.3) {
    return 0.1;
  } else if (x >= 0.2) {
    return 0.0;
  } else if (x >= 0.1) {
    return -0.1;
  }
  return -0.4;
}

function easePop(x) {
  if (x >= 1) {
    return 0.1;
  } else if (x >= 0.96) {
    return 0.1;
  } else if (x >= 0.93) {
    return 0.2;
  } else if (x >= 0.9) {
    return 0.4;
  } else if (x >= 0.8) {
    return 0.8;
  } else if (x >= 0.7) {
    return 1.6;
  } else if (x >= 0.6) {
    return 3.2;
  } else if (x >= 0.5) {
    return 4.0;
  } else if (x >= 0.4) {
    return 3.2;
  } else if (x >= 0.3) {
    return 1.6;
  } else if (x >= 0.2) {
    return 0.8;
  } else if (x >= 0.1) {
    return 0.4;
  }
  return 0.1;
}

function easeFire(x) {
  if (x >= 0.85) {
    return 0.05;
  } else if (x >= 0.8) {
    return 0.1;
  } else if (x >= 0.75) {
    return 0.2;
  } else if (x >= 0.7) {
    return 0.3;
  } else if (x >= 0.65) {
    return 0.4;
  } else if (x >= 0.6) {
    return 0.6;
  } else if (x >= 0.5) {
    return 0.8;
  } else if (x >= 0.4) {
    return 1.0;
  } else if (x >= 0.3) {
    return 1.2;
  } else if (x >= 0.2) {
    return 1.5;
  } else if (x >= 0.1) {
    return 1.0;
  }
  return 0.8;
}

function easeFire2(x) {
  if (x >= 0.85) {
    return 0.05;
  } else if (x >= 0.8) {
    return 0.2;
  } else if (x >= 0.75) {
    return 0.4;
  } else if (x >= 0.7) {
    return 0.7;
  } else if (x >= 0.65) {
    return 0.9;
  } else if (x >= 0.6) {
    return 0.6;
  } else if (x >= 0.5) {
    return 0.5;
  } else if (x >= 0.4) {
    return 0.6;
  } else if (x >= 0.3) {
    return 0.9;
  } else if (x >= 0.2) {
    return 1.2;
  } else if (x >= 0.1) {
    return 1.5;
  }
  return 0.8;
}
