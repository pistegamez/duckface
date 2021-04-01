spriteTypes["pill-plus"] = new SpriteType({
    id: "pill-plus",
    name: "Pill (Grow)",
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
            width: 6,
            height: 6
        }
    },
    behaviours: ["changes-collectors-size", "removed-if-energy-0", "blocks-completion"],
    paths: {
        body: {
            fill: "#ffff80",
            stroke: "#303030",
            commands: [
                { c: "el", x: 0.5, y: 0.5, rx: 1.0, ry: 1.0 },
            ]
        },
        plus: {
            stroke: "#303030",
            commands: [
                { c: "mt", x: 0.5, y: 0.2 },
                { c: "lt", x: 0.5, y: 0.8 },
                { c: "mt", x: 0.2, y: 0.5 },
                { c: "lt", x: 0.8, y: 0.5 },
            ]
        }
    }
});