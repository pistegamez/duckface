/* eslint-disable no-undef */
spriteTypes["pill-mega-placebo"] = new SpriteType({
  id: "pill-mega-placebo",
  name: "Pill (Resizable Placebo)",
  shape: SHAPES.CIRCLE,
  resizable: true,
  collectable: true,
  collidesWithObstacles: false,
  spriteProps: {
    role: ROLES.ITEM,
    weight: 0,
    maxVelocity: { x: 0, y: 0 },
  },
  isDamagedBy: [DAMAGE_TYPES.EAT],
  dyingEffect: {
    sound: "collect",
    particleType: "crumb",
    particles: 25,
  },
  behaviours: ["removed-if-health-0", "blocks-completion"],
  paths: {
    body: {
      fill: "#ffff80",
      stroke: "#303030",
      commands: [{ c: "el", x: 0.5, y: 0.5, rx: 1.0, ry: 1.0 }],
    },
  },
});
