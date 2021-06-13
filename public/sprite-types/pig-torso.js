/* eslint-disable no-undef */
spriteTypes.torso = new SpriteType({
  id: "torso",
  name: "Torso",
  resizable: true,
  spriteProps: {
    maxVelocity: {
      x: 0.65,
      y: 6,
    },
    isObstacle: true,
    acceleration: 0.03,
  },
  collidesWithObstacles: true,
  collisidesWithSprites: true,
  movedByOtherSprites: true,
  behaviours: [
    "idles",
    "moves-stops",
    "changes-direction-on-collision",
    "falls",
  ],
  isDamagedBy: [DAMAGE_TYPES.FIRE],
  shaded: true,
  animations: {
    idle: [
      {
        frame: "default",
      },
    ],
    move: [
      {
        frame: "walk-1",
        s: 0.2,
      },
      {
        frame: "walk-2",
        s: 0.2,
        loop: 0,
      },
    ],
  },
  frames: {
    default: [
      {
        path: "body",
      },
      {
        path: "hand",
      },
    ],
    "walk-1": [
      {
        path: "walk-1",
      },
      {
        path: "hand",
      },
    ],
    "walk-2": [
      {
        path: "walk-2",
      },
      {
        path: "hand",
        x: 0.05,
      },
    ],
  },
  paths: {
    body: {
      fill: "#ffa0a0",
      stroke: "#303030",
      commands: [
        {
          c: "mt",
          x: 0,
          y: 0,
        },
        {
          c: "lt",
          x: 0,
          y: 1,
        },
        {
          c: "lt",
          x: 0.25,
          y: 1,
        },
        {
          c: "lt",
          x: 0.25,
          y: 0.8,
        },
        {
          c: "lt",
          x: 0.75,
          y: 0.8,
        },
        {
          c: "lt",
          x: 0.75,
          y: 1,
        },
        {
          c: "lt",
          x: 1,
          y: 1,
        },
        {
          c: "lt",
          x: 1,
          y: 0,
        },
        {
          c: "cp",
        },
        {
          c: "mt",
          x: 0.2,
          y: 0.8,
        },
        {
          c: "lt",
          x: 0.9,
          y: 0.8,
        },
      ],
    },
    "walk-1": {
      fill: "#ffa0a0",
      stroke: "#303030",
      commands: [
        {
          c: "mt",
          x: -0.02,
          y: 0.01,
        },
        {
          c: "lt",
          x: 0,
          y: 1,
        },
        {
          c: "lt",
          x: 0.25,
          y: 1,
        },
        {
          c: "lt",
          x: 0.25,
          y: 0.8,
        },
        {
          c: "lt",
          x: 0.7,
          y: 0.75,
        },
        {
          c: "lt",
          x: 0.9,
          y: 1,
        },
        {
          c: "lt",
          x: 1.1,
          y: 0.8,
        },
        {
          c: "lt",
          x: 1,
          y: 0.7,
        },
        {
          c: "lt",
          x: 0.9,
          y: -0.01,
        },
        {
          c: "cp",
        },
        {
          c: "mt",
          x: 0.2,
          y: 0.8,
        },
        {
          c: "lt",
          x: 0.9,
          y: 0.72,
        },
      ],
    },
    "walk-2": {
      fill: "#ffa0a0",
      stroke: "#303030",
      commands: [
        {
          c: "mt",
          x: 0.05,
          y: 0,
        },
        {
          c: "lt",
          x: 0,
          y: 0.6,
        },
        {
          c: "lt",
          x: -0.08,
          y: 0.9,
        },
        {
          c: "lt",
          x: 0.18,
          y: 0.97,
        },
        {
          c: "lt",
          x: 0.25,
          y: 0.75,
        },
        {
          c: "lt",
          x: 0.7,
          y: 0.8,
        },
        {
          c: "lt",
          x: 0.7,
          y: 1,
        },
        {
          c: "lt",
          x: 1,
          y: 1,
        },
        {
          c: "lt",
          x: 1,
          y: 0.02,
        },
        {
          c: "cp",
        },
        {
          c: "mt",
          x: 0.2,
          y: 0.74,
        },
        {
          c: "lt",
          x: 0.85,
          y: 0.82,
        },
      ],
    },
    hand: {
      stroke: "#303030",
      commands: [
        {
          c: "mt",
          x: 0.1,
          y: 0.2,
        },
        {
          c: "lt",
          x: 0.1,
          y: 0.5,
        },
        {
          c: "lt",
          x: 0.3,
          y: 0.5,
        },
        {
          c: "lt",
          x: 0.3,
          y: 0.2,
        },
        {
          c: "mt",
          x: 0.22,
          y: 0.4,
        },
        {
          c: "lt",
          x: 0.22,
          y: 0.5,
        },
      ],
    },
  },
});
