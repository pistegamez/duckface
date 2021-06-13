/* eslint-disable no-undef */
spriteTypes.ghost = new SpriteType({
  id: "ghost",
  name: "Ghost",
  shape: SHAPES.BOX,
  collidesWithObstacles: true,
  movedByOtherSprites: false,
  resizable: true,
  collisionBox: { t: 0.1, r: 0.9, b: 0.9, l: 0.1 },
  spriteProps: {
    role: ROLES.ENEMY,
    isObstacle: false,
    weight: 0,
    maxVelocity: { x: 1, y: 0 },
    acceleration: 0.04,
  },
  damage: 1,
  damageType: DAMAGE_TYPES.SPOOK,
  isDamagedBy: [],
  patterns: {
    default: {
      behaviours: [
        "changes-direction-on-collision",
        "idles",
        "moves-forward",
        "floats",
        /* "kills-player", */
        "is-happy-when-completed",
      ],
    },
    happy: {
      animation: "happy",
      behaviours: [],
    },
  },
  animations: {
    idle: [
      { frame: "eyes-open", s: 3 },
      { frame: "eyes-closed", s: 1 },
    ],
    move: [
      { frame: "eyes-open", s: 3 },
      { frame: "eyes-closed", s: 1 },
      { frame: "eyes-open", s: 4 },
      { frame: "eyes-closed", s: 1 },
      { frame: "eyes-open", s: 1 },
      { frame: "eyes-closed", s: 1, loop: 0 },
    ],
    happy: [{ frame: "happy" }],
  },
  frames: {
    "eyes-open": [{ path: "body" }, { path: "mouth" }, { path: "eyes-open" }],
    "eyes-closed": [
      { path: "body" },
      { path: "mouth" },
      { path: "eyes-closed" },
    ],
    happy: [{ path: "body" }, { path: "smile" }, { path: "eyes-closed" }],
  },
  paths: {
    body: {
      fill: "rgba(225,255,225,0.85)",
      stroke: "rgba(240,255,240,0.85)",
      commands: [
        { c: "mt", x: 0.0, y: 0.0 },
        { c: "lt", x: 1.0, y: 0.0 },
        { c: "lt", x: 1.0, y: 1.05 },
        { c: "lt", x: 0.75, y: 0.95 },
        { c: "lt", x: 0.5, y: 1.05 },
        { c: "lt", x: 0.25, y: 0.95 },
        { c: "lt", x: 0.0, y: 1.05 },
        { c: "cp" },
      ],
    },
    "eyes-open": {
      fill: "rgba(48,68,88,0.65)",
      commands: [
        { c: "el", x: 0.88, y: 0.4, rx: 0.1, ry: 0.2, ra: -0.3 },
        { c: "el", x: 0.39, y: 0.4, rx: 0.15, ry: 0.2, ra: 0.3 },
      ],
    },
    "eyes-closed": {
      stroke: "rgba(48,48,48,0.65)",
      commands: [
        { c: "ar", x: 0.37, y: 0.38, r: 0.08, sa: 0.0, ea: 0.5 },
        { c: "mt", x: 0.88, y: 0.38 },
        { c: "ar", x: 0.86, y: 0.38, r: 0.08, sa: 0.0, ea: 0.5 },
      ],
    },
    mouth: {
      stroke: "rgba(48,48,48,0.65)",
      commands: [
        { c: "mt", x: 0.55, y: 0.65 },
        { c: "qc", x: 0.75, y: 0.65, cpx: 0.7, cpy: 0.5 },
      ],
    },
    smile: {
      stroke: "rgba(48,48,48,0.65)",
      commands: [
        { c: "mt", x: 0.55, y: 0.5 },
        { c: "qc", x: 0.75, y: 0.5, cpx: 0.65, cpy: 0.65 },
      ],
    },
  },
});
