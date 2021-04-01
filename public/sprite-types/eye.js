spriteTypes.eye = new SpriteType({
    id: "eye",
    name: "Eye",
    shape: SHAPES.CIRCLE,
    resizable: true,
    collectable: true,
    collidesWithObstacles: false,
    behaviours: ["blocks-completion", "is-accessory"],
    spriteProps: {
        weight: 0
    },
    animations: {
        idle: [
            { frame: "middle", s: 1 },
            { frame: "left", s: 1 },
            { frame: "middle", s: 1 },
            { frame: "right", s: 1, loop: 0 },
        ],
    },
    frames: {
        "middle": [{ path: "eye" }, { path: "pupil" }],
        "left": [{ path: "eye" }, { path: "pupil", x: -0.2 }],
        "right": [{ path: "eye" }, { path: "pupil", x: 0.2 }],
    },
    paths: {
        eye: {
            fill: "#ffff80",
            stroke: "#303030",
            commands: [
                { c: "el", x: 0.5, y: 0.5, rx: 1.0, ry: 1.0 },
            ]
        },
        pupil: {
            fill: "#303030",
            commands: [
                { c: "el", x: 0.5, y: 0.5, rx: 0.2, ry: 0.2 },
            ]
        }
    }
});