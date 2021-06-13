/* eslint-disable no-undef */
spriteTypes["1-eyed-zombie"] = new SpriteType({
  id: "1-eyed-zombie",
  name: "Zombie (One Eyed)",
  shape: SHAPES.BOX,
  resizable: true,
  collidesWithObstacles: true,
  collisionBox: { t: 0.1, r: 0.98, b: 1.0, l: 0.02 },
  spriteProps: {
    role: ROLES.ENEMY,
    isObstacle: true,
    maxVelocity: { x: 3, y: 6 },
  },
  isDamagedBy: [DAMAGE_TYPES.SPIKE, DAMAGE_TYPES.FIRE],
  dyingEffect: {
    sound: "collect",
    particleType: "crumb",
    particles: 10,
  },
  patterns: {
    default: {
      behaviours: [
        "idles",
        "looks-around",
        "follows-player",
        "changes-players-type",
        "is-happy-when-completed",
        "removed-if-health-0",
      ],
    },
    happy: {
      animation: "happy",
      behaviours: [],
    },
  },
  animations: {
    idle: [
      { frame: "default", s: 2 },
      { frame: "look-1", s: 1, loop: 0 },
    ],
    move: [
      { frame: "look-1", s: 0.1 },
      { frame: "look-1", s: 0.1, w: 1.05, h: 0.95, y: 0.05, x: -0.025 },
      { frame: "look-2", s: 0.1, w: 1.1, h: 0.9, y: 0.1, x: -0.05 },
      {
        frame: "look-2",
        s: 0.1,
        w: 1.05,
        h: 0.95,
        y: 0.05,
        x: -0.025,
        loop: 0,
      },
    ],
    /*
        "jump-up": [
            { frame: "default", x: 0.01, w: 0.98, h: 1.01 },
        ],
        "jump-down": [
            { frame: "default", s: 0.25, x: 0.025, y: -0.05, w: 0.95, h: 1.1 },
        ],
        "jump-middle": [
            { frame: "default", s: 0.25, x: -0.01, w: 1.02, h: 0.98 },
        ],
        happy: [{ frame: "happy" }],
        */
  },
  frames: {
    default: [
      { path: "body" },
      { path: "mouth" },
      { path: "teeth" },
      { path: "x-eye" },
      { path: "o-eye" },
      { path: "pupil" },
    ],
    "look-1": [
      { path: "body" },
      { path: "mouth" },
      { path: "teeth" },
      { path: "x-eye" },
      { path: "o-eye" },
      { path: "pupil", x: 0.05 },
    ],
    "look-2": [
      { path: "body-move" },
      { path: "mouth-open" },
      { path: "teeth-open" },
      { path: "x-eye" },
      { path: "o-eye" },
      { path: "pupil", x: 0.05 },
    ],
    /*
        "default-2": [
            { path: "body" },
            { path: "mouth" },
            { path: "teeth", x: 0.025 },
            { path: "eyes", x: 0.025 }
        ],
        "default-3": [
            { path: "body" },
            { path: "mouth" },
            { path: "teeth", x: 0.05 },
            { path: "eyes", x: 0.05 }
        ],
        "happy": [
            { path: "body" },
            { path: "smile" },
            { path: "teeth" },
            { path: "eyes" }
        ]*/
  },
  paths: {
    body: {
      fill: "#55ff55",
      stroke: "#303030",
      commands: [{ c: "rc", l: 0.0, t: 0.0, r: 1.0, b: 1.0 }],
    },

    "body-move": {
      fill: "#55ff55",
      stroke: "#303030",
      commands: [
        { c: "mt", x: 0.0, y: 0.0 },
        { c: "lt", x: 1.0, y: 0.0 },
        { c: "lt", x: 1.0, y: 0.6 },
        { c: "lt", x: 0.2, y: 0.6 },
        { c: "lt", x: 0.2, y: 0.8 },
        { c: "lt", x: 1.0, y: 0.8 },
        { c: "lt", x: 1.0, y: 1.0 },
        { c: "lt", x: 0.0, y: 1.0 },
        { c: "lt", x: 0.0, y: 0.0 },
      ],
    },
    "x-eye": {
      stroke: "#303030",
      lineWidth: 1,
      commands: [
        { c: "mt", x: 0.25, y: 0.4 },
        { c: "lt", x: 0.35, y: 0.5 },
        { c: "mt", x: 0.35, y: 0.4 },
        { c: "lt", x: 0.25, y: 0.5 },
      ],
    },
    "o-eye": {
      stroke: "#303030",
      fill: "#ffffa0",
      lineWidth: 1,
      commands: [{ c: "ar", x: 0.9, y: 0.35, r: 0.25 }],
    },
    pupil: {
      fill: "#303030",
      commands: [{ c: "ar", x: 0.9, y: 0.35, r: 0.05 }],
    },
    teeth: {
      stroke: "#303030",
      lineWidth: 1,
      commands: [
        { c: "mt", x: 0.65, y: 0.55 },
        { c: "lt", x: 0.65, y: 0.65 },
        { c: "mt", x: 0.5, y: 0.55 },
        { c: "lt", x: 0.5, y: 0.65 },
        { c: "mt", x: 0.8, y: 0.55 },
        { c: "lt", x: 0.8, y: 0.65 },
      ],
    },
    mouth: {
      stroke: "#303030",
      lineWidth: 1,
      commands: [
        // mouth
        { c: "mt", x: 0.25, y: 0.6 },
        { c: "lt", x: 1.0, y: 0.6 },
      ],
    },
    "teeth-open": {
      stroke: "#303030",
      lineWidth: 1,
      commands: [
        { c: "mt", x: 0.65, y: 0.55 },
        { c: "lt", x: 0.65, y: 0.85 },
        { c: "mt", x: 0.5, y: 0.55 },
        { c: "lt", x: 0.5, y: 0.85 },
        { c: "mt", x: 0.8, y: 0.55 },
        { c: "lt", x: 0.8, y: 0.85 },
      ],
    },
    "mouth-open": {
      fill: "#303030",
      commands: [
        // mouth
        { c: "rc", l: 0.2, t: 0.6, r: 0.85, b: 0.8 },
      ],
    },
    smile: {
      stroke: "#303030",
      lineWidth: 1,
      commands: [
        { c: "mt", x: 0.15, y: 0.45 },
        { c: "qc", x: 1.0, y: 0.5, cpx: 0.4, cpy: 0.5 },
      ],
    },
  },
});
