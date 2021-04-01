spriteTypes.lock = new SpriteType({
    id: "lock",
    name: "Lock",
    shape: SHAPES.BOX,
    resizable: true,
    collidesWithObstacles: true,
    spriteProps: {
        isObstacle: true,
        weight: 0,
        maxVelocity: { x: 0, y: 0 },
    },
    behaviours: ["is-lock", "is-x-locked", "is-y-locked", "removed-if-energy-0"],
    paths: {
        body: {
            fill: "#d0d0d0",
            stroke: "#303030",
            commands: [{ c: "rc", l: 0.0, t: 0.0, r: 1.0, b: 1.0 }]
        },
        hilight: {
            stroke: "#e0e0e0",
            commands: [
                { c: "mt", x: 0.075, y: 0.06 },
                { c: "lt", x: 0.06, y: 0.075 }
            ]
        },
        "keyhole-top": {
            fill: "#303030",
            commands: [
                { c: "ar", x: 0.5, y: 0.4, r: 0.3  },
            ]
        },
        "keyhole-bottom": {
            fill: "#303030",
            commands: [
                { c: "mt", x: 0.45, y: 0.5 },
                { c: "lt", x: 0.40, y: 0.8 },
                { c: "lt", x: 0.60, y: 0.8 },
                { c: "lt", x: 0.55, y: 0.5 },
                { c: "cp" }
            ]
        },
    }
});