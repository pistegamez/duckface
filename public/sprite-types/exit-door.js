spriteTypes["exit-door"] = new SpriteType({
    id: "exit-door",
    name: "Exit Door",
    shape: SHAPES.BOX,
    resizable: true,
    collidesWithObstacles: false,
    spriteProps: {
        isObstacle: false,
        weight: 0
    },
    behaviours: ["exit"],
    paths: {
        body: {
            fill: "#404040",
            stroke: "#303030",
            commands: [
                { c: "rc", l: 0.1, t: 0.1, r: 0.9, b: 1.0 },
            ]
        },
        frames: {
            stroke: "#303030",
            commands: [
                { c: "rc", l: 0.0, t: 0.0, r: 1.0, b: 1.0 },
            ]
        }
    }
});