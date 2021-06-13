/* eslint-disable no-undef */
spriteTypes.chili = new SpriteType({
  id: "chili",
  name: "Chili",
  shape: SHAPES.CIRCLE,
  resizable: false,
  collectable: true,
  collidesWithObstacles: false,
  spriteProps: {
    role: ROLES.ITEM,
    width: 16,
    height: 32,
    weight: 0,
    maxVelocity: { x: 0, y: 0 },
    transform: {
      pattern: "warmup",
    },
  },
  isDamagedBy: [DAMAGE_TYPES.EAT, DAMAGE_TYPES.FIRE],
  dyingEffect: {
    sound: "collect",
    particleType: "crumb",
    particles: 10,
  },
  removable: false,
  behaviours: ["changes-collectors-pattern", "reborns"],
  paths: {
    body: {
      fill: "#ff3030",
      stroke: "#303030",
      commands: [
        { c: "mt", x: 0.5, y: 0 },
        { c: "qc", x: 0.0, y: 0.3, cpx: 0.0, cpy: 0.0 },
        { c: "qc", x: -0.1, y: 1.0, cpx: 0.1, cpy: 0.7 },
        { c: "qc", x: 1.0, y: 0.3, cpx: 1.0, cpy: 0.8 },
        { c: "qc", x: 0.5, y: 0.0, cpx: 1.0, cpy: 0.0 },
        { c: "cp" },
      ],
    },
    hilight: {
      stroke: "#ffe090",
      lineWidth: 2,
      commands: [
        { c: "mt", x: 0.3, y: 0.2 },
        { c: "lt", x: 0.3, y: 0.3 },
      ],
    },
    stem: {
      stroke: "#30a030",
      lineWidth: 1.5,
      outlineWidth: 6,
      outlineColor: "#303030",
      commands: [
        { c: "mt", x: 0.5, y: 0 },
        { c: "qc", x: 0.0, y: -0.3, cpx: 0.5, cpy: -0.3 },
      ],
    },
  },
});
