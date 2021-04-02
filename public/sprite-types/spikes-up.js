spriteTypes["spikes-up"] = new SpriteType({
    id: "spikes-up",
    name: "Spikes Up",
    shape: SHAPES.BOX,
    shaded: false,
    resizable: true,
    collidesWithObstacles: false,
    collisionBox: { t: 0.1, r: 0.8, b: 1, l: 0.2, },
    spriteProps: {
        weight: 0,
        isObstacle: false,
        maxVelocity: { x: 0, y: 0 }
    },
    behaviours: ["kills-falling"],
    paths: {
        spikes: {
            fill: "#d0d0d0",
            stroke: "#303030",
            commands: [
                { c: "mt", x: 0.00, y: 1.0 },
                { c: "lt", x: 0.25, y: 0.0 },
                { c: "lt", x: 0.50, y: 1.0 },
                { c: "lt", x: 0.75, y: 0.0 },
                { c: "lt", x: 1.00, y: 1.0 },
                { c: "cp" }
            ]
        }
    }
});