spriteTypes["platform-vertical"] = new SpriteType({
  id: "platform-vertical",
  name: "Moving Platform (Vertical)",
  shape: SHAPES.BOX,
  resizable: true,
  collidesWithObstacles: true,
  spriteProps: {
    isObstacle: true,
    isElevator: true,
    weight: 0,
    maxVelocity: { x: 0, y: 1 },
  },
  isDamagedBy: [],
  behaviours: [
    "changes-vertical-direction-on-tile-collision",
    "moves-upward",
    "is-x-locked",
  ],
  paths: {
    body: {
      fill: "#d0d0d0",
      stroke: "#303030",
      commands: [{ c: "rc", l: 0.0, t: 0.0, r: 1.0, b: 1.0 }],
    },
  },
});
