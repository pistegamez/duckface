spriteTypes["pill-speed"] = new SpriteType({
    id: "pill-speed",
    name: "Pill (Speed)",
    shape: SHAPES.CIRCLE,
    resizable: false,
    collectable: true,
    collidesWithObstacles: false,
    spriteProps: {
        width: 16,
        height: 16,
        weight: 0,
        maxVelocity: { x: 0, y: 0 },
        transform: {
            maxVelocityX: 1,
        }
    },
    behaviours: ["throttle-players-max-speed", "removed-if-energy-0", "blocks-completion"],
    paths: {
        body: {
            fill: "#ffff80",
            stroke: "#303030",
            commands: [
                { c: "el", x: 0.5, y: 0.5, rx: 1.0, ry: 1.0 },
            ]
        },
        s: {
            stroke: "#303030",
            lineWidth: 1,
            commands: [
                { c: "mt", x: 0.7, y: 0.3 },
                { c: "lt", x: 0.3, y: 0.3 },
                { c: "lt", x: 0.3, y: 0.5 },
                { c: "lt", x: 0.7, y: 0.5 },
                { c: "lt", x: 0.7, y: 0.7 },
                { c: "lt", x: 0.3, y: 0.7 },
            ]
        }
    }
});