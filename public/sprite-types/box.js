/* eslint-disable no-undef */
spriteTypes.box = new SpriteType({
  id: "box",
  name: "Box (Movable)",
  shape: SHAPES.BOX,
  resizable: true,
  collidesWithObstacles: true,
  spriteProps: {
    isObstacle: true,
  },
  isDamagedBy: [DAMAGE_TYPES.FIRE],
  behaviours: ["falls"],
  animations: {
    idle: [{ frame: "default" }],
    "jump-up": [{ frame: "bent-up", x: 0.005, w: 0.99, h: 1.005 }],
    "jump-down": [
      { frame: "bent-down", s: 0.25, x: 0.025, y: -0.005, w: 0.99, h: 1.01 },
    ],
    "jump-middle": [{ frame: "default", s: 0.25, x: 0, w: 1, h: 1 }],
  },
  frames: {
    default: [{ path: "body" }],
    "bent-up": [{ path: "bent-up" }],
    "bent-down": [{ path: "bent-down" }],
  },
  paths: {
    body: {
      fill: "#ffc080",
      stroke: "#303030",
      commands: [{ c: "rc", l: 0.0, t: 0.0, r: 1.0, b: 1.0 }],
    },
    "bent-up": {
      fill: "#ffc080",
      stroke: "#303030",
      commands: [
        { c: "mt", x: 0.0, y: 0.0 },
        { c: "qc", x: 1.0, y: 0.0, cpx: 0.5, cpy: -0.1 },
        { c: "lt", x: 1.0, y: 1.0 },
        { c: "qc", x: 0.0, y: 1.0, cpx: 0.5, cpy: 0.9 },
        { c: "cp" },
      ],
    },
    "bent-down": {
      fill: "#ffc080",
      stroke: "#303030",
      commands: [
        { c: "mt", x: 0.0, y: 0.0 },
        { c: "qc", x: 1.0, y: 0.0, cpx: 0.5, cpy: 0.1 },
        { c: "lt", x: 1.0, y: 1.0 },
        { c: "qc", x: 0.0, y: 1.0, cpx: 0.5, cpy: 1.1 },
        { c: "cp" },
      ],
    },
  },
});
