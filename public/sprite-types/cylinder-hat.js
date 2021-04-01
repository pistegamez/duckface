spriteTypes["cylinder-hat"] = new SpriteType({
    id: "cylinder-hat",
    name: "Cylinder Hat",
    shape: SHAPES.BOX,
    resizable: true,
    collidesWithObstacles: true,
    spriteProps: {
        isObstacle: true,
    },
    behaviours: [],
    animations: {
        idle: [
            { frame: "default" },
        ],
    },
    frames: {
        "default": [{ path: "body" }],
    },
    paths: {
        body: {
            fill: "#484848",
            stroke: "#303030",
            commands: [
                { c: "rc", l: 0.0, t: 0.0, r: 1.0, b: 0.9 },
                { c: "rc", l: -0.28, t: 0.9, r: 1.28, b: 1.0 }
            ]
        }
    }
});