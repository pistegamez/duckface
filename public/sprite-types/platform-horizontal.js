spriteTypes["platform-horizontal"] = new SpriteType({
    id: "platform-horizontal",
    name: "Moving Platform (Sideways)",
    shape: SHAPES.BOX,
    collidesWithObstacles: true,
    resizable: true,
    spriteProps: {
        isObstacle: true,
        isElevator: true,
        weight: 0,
        maxVelocity: { x: 1, y: 0 },
    },
    behaviours: ["changes-direction-on-collision", "moves-forward", "is-y-locked"],
    paths: {
        body: {
            fill: "#d0d0d0",
            stroke: "#303030",
            commands: [{ c: "rc", l: 0.0, t: 0.0, r: 1.0, b: 1.0 }]
        }
    }
});