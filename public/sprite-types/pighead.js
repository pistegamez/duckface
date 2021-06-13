/* eslint-disable no-undef */
spriteTypes.pighead = new SpriteType({
  id: "pighead",
  name: "Pighead",
  shape: SHAPES.BOX,
  collidesWithObstacles: true,
  resizable: true,
  // collisionBox: { t: 0.1, r: 0.9, b: 0.9, l: 0.1, },
  spriteProps: {
    role: ROLES.FRIEND,
    maxJump: 12,
    isObstacle: true,
    weight: 0.25,
    maxVelocity: { x: 2, y: 6 },
  },
  damage: 1,
  damageType: DAMAGE_TYPES.EAT,
  attackAnimation: "eat",
  dyingEffect: {
    // sound: "collect",
    particleType: "star",
    particles: 10,
  },
  patterns: {
    default: {
      behaviours: [
        "unfails",
        "idles",
        "jumps",
        "moves",
        "looks-at-player",
        "grows",
        "collects",
        "dies",
        "is-happy-when-completed",
      ],
    },
    happy: {
      animation: "happy",
      behaviours: ["unfails"],
    },
    dead: {
      animation: "dead",
      behaviours: ["unfails"],
    },
  },
  animations: {
    idle: [
      { frame: "eyes-open", s: 3 },
      { frame: "eyes-closed", s: 1 },
      { frame: "eyes-open", s: 4 },
      { frame: "eyes-closed", s: 1 },
      { frame: "eyes-open", s: 1 },
      { frame: "eyes-closed", s: 1, loop: 0 },
    ],
    move: [
      { frame: "eyes-open", s: 0.2 },
      { frame: "eyes-open-2", s: 0.2, x: -0.01, y: 0.01, w: 1.02, h: 0.99 },
      { frame: "eyes-open-3", s: 0.2, x: -0.01, y: 0.02, w: 1.02, h: 0.98 },
      {
        frame: "eyes-open-2",
        s: 0.2,
        x: -0.01,
        y: 0.01,
        w: 1.02,
        h: 0.99,
        loop: 0,
      },
    ],
    "jump-up": [{ frame: "eyes-open", x: 0.01, w: 0.98, h: 1.01 }],
    "jump-down": [{ frame: "eyes-open", x: 0.025, y: -0.05, w: 0.95, h: 1.1 }],
    "jump-middle": [{ frame: "eyes-open", x: -0.01, w: 1.02, h: 0.98 }],
    happy: [{ frame: "happy" }],
    dead: [{ frame: "dead" }],
    collect: [
      { frame: "mouth-open", s: 0.1 },
      { frame: "eyes-open", s: 0.1, loop: 0 },
    ],
  },
  frames: {
    "mouth-open": [
      { path: "body" },
      { path: "eyes-open" },
      { path: "mouth-open" },
      { path: "snout", y: -0.2 },

      { path: "ears" },
    ],
    "eyes-open": [
      { path: "body" },
      { path: "snout" },
      { path: "eyes-open" },
      { path: "ears" },
    ],
    "eyes-open-2": [
      { path: "body" },
      { path: "snout", x: 0.05 },
      { path: "eyes-open", x: 0.05 },
      { path: "ears" },
    ],
    "eyes-open-3": [
      { path: "body" },
      { path: "snout", x: 0.1 },
      { path: "eyes-open", x: 0.1 },
      { path: "ears" },
    ],
    "eyes-closed": [
      { path: "body" },
      { path: "snout" },
      { path: "eyes-closed" },
      { path: "ears" },
    ],
    happy: [
      { path: "body" },
      { path: "snout" },
      { path: "eyes-closed" },
      { path: "ears" },
    ],
    dead: [
      { path: "body" },
      { path: "snout" },
      { path: "eyes-x" },
      { path: "ears" },
    ],
  },
  paths: {
    body: {
      fill: "#ffa0a0",
      stroke: "#303030",
      commands: [{ c: "rc", l: 0.0, t: 0.0, r: 1.0, b: 1.0 }],
    },
    "eyes-open": {
      stroke: "#303030",
      lineWidth: 1,
      commands: [
        { c: "mt", x: 0.15, y: 0.3 },
        { c: "lt", x: 0.15, y: 0.35 },
        { c: "mt", x: 0.85, y: 0.25 },
        { c: "lt", x: 0.85, y: 0.3 },
      ],
    },
    "eyes-closed": {
      stroke: "#303030",
      commands: [
        { c: "ar", x: 0.13, y: 0.33, r: 0.05, sa: 0.0, ea: 0.5 },
        { c: "mt", x: 0.86, y: 0.28 },
        { c: "ar", x: 0.83, y: 0.28, r: 0.05, sa: 0.0, ea: 0.5 },
      ],
    },
    "eyes-x": {
      stroke: "#303030",
      lineWidth: 1,
      commands: [
        { c: "mt", x: 0.11, y: 0.28 },
        { c: "lt", x: 0.2, y: 0.37 },
        { c: "mt", x: 0.2, y: 0.28 },
        { c: "lt", x: 0.11, y: 0.37 },

        { c: "mt", x: 0.9, y: 0.23 },
        { c: "lt", x: 0.81, y: 0.32 },
        { c: "mt", x: 0.81, y: 0.23 },
        { c: "lt", x: 0.9, y: 0.32 },
      ],
    },
    snout: {
      fill: "#ff8080",
      stroke: "#303030",
      commands: [
        { c: "rc", l: 0.55, t: 0.35, r: 1.1, b: 0.7 },
        { c: "mt", x: 0.7, y: 0.48 },
        { c: "lt", x: 0.7, y: 0.58 },
        { c: "mt", x: 1.0, y: 0.48 },
        { c: "lt", x: 1.0, y: 0.58 },
      ],
    },
    "mouth-open": {
      fill: "#303030",
      commands: [{ c: "rc", l: 0.54, t: 0.47, r: 0.9, b: 0.9 }],
    },
    ears: {
      fill: "#ffa0a0",
      stroke: "#303030",
      commands: [
        { c: "rc", l: 0.0, t: -0.1, r: 0.25, b: 0.0 },
        { c: "rc", l: 0.8, t: -0.1, r: 1.05, b: 0.0 },
      ],
    },
  },
});
