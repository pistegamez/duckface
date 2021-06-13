/* eslint-disable no-undef */
spriteTypes["exit-door"] = new SpriteType({
  id: "exit-door",
  name: "Exit Door",
  shape: SHAPES.BOX,
  resizable: true,
  shaded: false,
  collidesWithObstacles: false,
  spriteProps: {
    isObstacle: false,
    weight: 0,
    maxVelocity: { x: 0, y: 0 },
  },
  behaviours: ["exit"],
  isDamagedBy: [],
  paths: {
    body: {
      fill: "#303030",
      stroke: "#303030",
      commands: [{ c: "rc", l: 0.1, t: 0.1, r: 0.9, b: 1.0 }],
    },
    frames: {
      stroke: "#303030",
      commands: [{ c: "rc", l: 0.0, t: 0.0, r: 1.0, b: 1.0 }],
    },
  },
});
