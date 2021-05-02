/* eslint-disable no-undef */
spriteTypes["cheeks-up"] = new SpriteType({
  id: "cheeks-up",
  name: "Cheeks (Blow Up)",
  shape: SHAPES.BOX,
  collidesWithObstacles: true,
  resizable: true,
  spriteProps: {
    isEnemy: true,
    isObstacle: true,
    weight: 0.2,
    maxVelocity: { x: 2, y: 6 },
    blowY: 0.2,
    blowX: 0.8,
    blowEnergy: 40,
    blowWait: 200,
    blowVelocityY: -10,
  },
  patterns: {
    default: {
      behaviours: [
        "changes-direction-on-collision",
        "idles",
        "blows",
        "kills-player",
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
      { frame: "eyes-open", s: 1.5 },
      { frame: "eyes-closed", s: 0.5 },
    ],
    blow: [{ frame: "blow", s: 3 }],
    move: [{ frame: "eyes-open", s: 3 }],
    happy: [{ frame: "happy" }],
  },
  frames: {
    "eyes-open": [
      { path: "body" },
      { path: "mouth" },
      { path: "eyebrows" },
      { path: "left-eye" },
      { path: "left-eye-pupil" },
      { path: "right-eye" },
      { path: "right-eye-pupil" },
      { path: "hair" },
    ],
    "eyes-closed": [
      { path: "body" },
      { path: "mouth" },
      { path: "eyebrows" },
      { path: "left-eye-closed" },
      { path: "right-eye-closed" },
      { path: "hair" },
    ],
    happy: [
      { path: "body" },
      { path: "mouth" },
      { path: "left-eye-closed" },
      { path: "right-eye-closed" },
      { path: "hair" },
    ],
    blow: [
      { path: "body" },
      { path: "mouth-blow" },
      { path: "eyebrows" },
      { path: "hair" },
      { path: "left-eye-closed" },
      { path: "right-eye-closed" },
    ],
  },
  paths: {
    body: {
      fill: "#ff7090",
      stroke: "#303030",
      commands: [{ c: "rc", l: 0, t: 0, b: 1, r: 1 }],
    },
    mouth: {
      stroke: "#303030",
      lineWidth: 1,
      commands: [
        { c: "mt", x: 0.74, y: 0.25 },
        { c: "lt", x: 0.85, y: 0.25 },

        { c: "mt", x: 0.74, y: 0.7 },
        { c: "lt", x: 0.85, y: 0.7 },

        { c: "mt", x: 0.8, y: 0.25 },
        { c: "lt", x: 0.8, y: 0.7 },
      ],
    },
    "mouth-blow": {
      fill: "#303030",
      commands: [{ c: "ar", x: 0.8, y: 0.4, r: 0.2 }],
    },
    eyebrows: {
      stroke: "#585858",
      lineWidth: 1.7,
      commands: [
        { c: "mt", x: 0.2, y: 0.15 },
        { c: "lt", x: 0.27, y: 0.19 },

        { c: "mt", x: 0.27, y: 0.7 },
        { c: "lt", x: 0.2, y: 0.74 },
      ],
    },
    "left-eye": {
      stroke: "#303030",
      fill: "#ffffff",
      lineWidth: 1.0,
      commands: [{ c: "ar", x: 0.52, y: 0.7, r: 0.25 }],
    },
    "left-eye-pupil": {
      fill: "#303030",
      commands: [{ c: "ar", x: 0.52, y: 0.72, r: 0.05 }],
    },
    "right-eye": {
      stroke: "#303030",
      fill: "#ffffff",
      lineWidth: 1.0,
      commands: [{ c: "ar", x: 0.49, y: 0.18, r: 0.25 }],
    },
    "right-eye-pupil": {
      fill: "#303030",
      commands: [{ c: "ar", x: 0.49, y: 0.16, r: 0.05 }],
    },
    "left-eye-closed": {
      stroke: "#303030",
      lineWidth: 1.0,
      commands: [{ c: "ar", x: 0.52, y: 0.7, r: 0.25, sa: -0.25, ea: 0.25 }],
    },
    "right-eye-closed": {
      stroke: "#303030",
      lineWidth: 1.0,
      commands: [{ c: "ar", x: 0.49, y: 0.18, r: 0.25, sa: -0.25, ea: 0.25 }],
    },
    hair: {
      stroke: "#303030",
      lineWidth: 1,
      commands: [
        { c: "mt", x: 0.2, y: -0.03 },
        { c: "lt", x: 0.2, y: 0.03 },
        { c: "mt", x: 0.8, y: -0.03 },
        { c: "lt", x: 0.8, y: 0.02 },
        { c: "mt", x: -0.02, y: 0.2 },
        { c: "lt", x: 0.02, y: 0.2 },
        { c: "mt", x: -0.03, y: 0.7 },
        { c: "lt", x: 0.02, y: 0.7 },
        { c: "mt", x: 0.97, y: 0.4 },
        { c: "lt", x: 1.02, y: 0.4 },
      ],
    },
  },
});
