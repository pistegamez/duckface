spriteTypes["flying-heart"] = new SpriteType({
    id: "flying-heart",
    name: "Heart (Flying)",
    shape: SHAPES.BOX,
    resizable: true,
    collectable: true,
    shaded: false,
    spriteProps: {
        maxVelocity: { x: 1, y: 6 },
        weight: 0,
        isObstacle: false
    },
    collidesWithObstacles: false,
    behaviours: ["changes-direction-on-collision", "moves-forward", "removed-if-energy-0", "blocks-completion", "floats"],
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
            fill: "#ff3090",
            stroke: "#303030",
            commands: [
                { c: "mt", x: 0.5, y: 1.2 },
                { c: "qc", x: 0.5, y: 0.1, cpx: -0.8, cpy: -0.6 },
                { c: "qc", x: 0.5, y: 1.2, cpx: 1.8, cpy: -0.6 },
            ]
        }
    }
});