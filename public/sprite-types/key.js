/* eslint-disable no-undef */
spriteTypes.key = new SpriteType({
  id: "key",
  name: "Key",
  shape: SHAPES.BOX,
  resizable: false,
  shaded: false,
  collectable: true,
  collisionBoxes: [{ t: 0.0, r: 0.7, b: 1.0, l: 0.3 }],
  spriteProps: {
    role: ROLES.ITEM,
    weight: 0.25,
    isKey: true,
    width: 32,
    height: 32,
    isObstacle: true,
  },
  isDamagedBy: [DAMAGE_TYPES.EAT],
  dyingEffect: {
    sound: "collect",
    particleType: "crumb",
    particles: 10,
    particleProps: { fill: "#ffff80" },
  },
  behaviours: ["blocks-completion", "removed-if-health-0"],
  paths: {
    inline: {
      lineWidth: 2,
      outlineWidth: 6,
      stroke: "#ffff80",
      commands: [
        { c: "ar", x: 0.5, y: 0.25, r: 0.5 },
        { c: "mt", x: 0.5, y: 0.5 },
        { c: "lt", x: 0.5, y: 0.99 },
        { c: "mt", x: 0.5, y: 0.8 },
        { c: "lt", x: 0.64, y: 0.8 },
        { c: "mt", x: 0.5, y: 0.9 },
        { c: "lt", x: 0.67, y: 0.9 },
      ],
    },
  },
});
