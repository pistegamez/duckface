/* eslint-disable no-undef */
spriteTypes["spikes-down"] = new SpriteType({
  id: "spikes-down",
  name: "Spikes Down",
  shape: SHAPES.BOX,
  shaded: false,
  resizable: true,
  collidesWithObstacles: false,
  collisionBox: { t: 0.0, r: 0.8, b: 0.9, l: 0.2 },
  spriteProps: {
    weight: 0,
    isObstacle: false,
    maxVelocity: { x: 0, y: 0 },
  },
  damage: 1,
  damageType: DAMAGE_TYPES.SPIKE,
  isDamagedBy: [],
  behaviours: ["damages-rising"],
  paths: {
    spikes: {
      fill: "#d0d0d0",
      stroke: "#303030",
      commands: [
        { c: "mt", x: 0.0, y: 0.0 },
        { c: "lt", x: 0.25, y: 1.0 },
        { c: "lt", x: 0.5, y: 0.0 },
        { c: "lt", x: 0.75, y: 1.0 },
        { c: "lt", x: 1.0, y: 0.0 },
        { c: "cp" },
      ],
    },
  },
});
