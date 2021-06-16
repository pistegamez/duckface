/* eslint-disable no-undef */
spriteTypes.fireball = new SpriteType({
  id: "fireball",
  name: "Fire Ball",
  shape: SHAPES.BOX,
  resizable: true,
  shaded: false,
  collidesWithObstacles: true,
  movedByOtherSprites: false,
  availableInEditor: false,
  collisionBoxes: [
    { t: 0.1, l: 0.1, r: 0.9, b: 0.9, testSprites: true, testTiles: false },
    { t: 0.4, l: 0.2, r: 0.8, b: 0.6, testSprites: false, testTiles: true },
  ],
  spriteProps: {
    isObstacle: false,
  },
  damage: 1,
  damageType: DAMAGE_TYPES.FIRE,
  isNotDamagedBy: [DAMAGE_TYPES.SPIKE],
  dyingEffect: {
    sound: "fire",
    particleType: "dust",
    particles: 10,
    particleProps: {
      energy: 0.1,
    },
  },
  behaviours: ["fireball"],
  animations: {
    idle: [{ frame: "flame-1" }],
  },
  frames: {
    "flame-1": [{ path: "flame" }],
  },
  paths: {
    flame: {
      lineWidth: 4,
      fill: "#ffffff",
      stroke: "#ffe000",
      commands: [
        { c: "mt", x: 0.5, y: 0.0 },
        { c: "lt", x: 1.0, y: 0.5 },
        { c: "lt", x: 0.5, y: 1.0 },
        { c: "lt", x: 0.0, y: 0.5 },
        { c: "cp" },
      ],
    },
  },
});
