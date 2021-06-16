/* eslint-disable no-undef */
spriteTypes.heart = new SpriteType({
  id: "heart",
  name: "Heart",
  shape: SHAPES.BOX,
  resizable: true,
  collectable: true,
  shaded: false,
  collidesWithObstacles: false,
  spriteProps: {
    role: ROLES.ITEM,
    floatStep: 20,
    floatFactor: 5,
    weight: 0,
    maxVelocity: { x: 0, y: 0 },
  },
  isDamagedBy: [DAMAGE_TYPES.EAT],
  dyingEffect: {
    sound: "collect",
    particleType: "crumb",
    particles: 10,
    particleProps: { fill: "#ff5050" },
  },
  behaviours: ["removed-if-health-0", "blocks-completion", "floats"],
  animations: {
    idle: [
      { frame: "frame-1", s: 0.9 },
      { frame: "frame-1", s: 0.03, w: 0.9, h: 0.9, x: 0.05, y: 0.05 },
      { frame: "frame-1", s: 0.04, w: 0.8, h: 0.8, x: 0.1, y: 0.1 },
      { frame: "frame-1", s: 0.05, w: 0.9, h: 0.9, x: 0.05, y: 0.05, loop: 0 },
    ],
  },
  frames: {
    "frame-1": [{ path: "heart" }],
  },
  paths: {
    heart: {
      fill: "#ff5050",
      stroke: "#303030",
      commands: [
        { c: "mt", x: 0.5, y: 1.2 },
        { c: "qc", x: 0.5, y: 0.1, cpx: -0.8, cpy: -0.6 },
        { c: "qc", x: 0.5, y: 1.2, cpx: 1.8, cpy: -0.6 },
      ],
    },
  },
});
