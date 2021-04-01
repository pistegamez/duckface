spriteTypes["ring"] = new SpriteType({
    id: "ring",
    name: "Ring",
    shape: SHAPES.CIRCLE,
    resizable: false,
    collectable: true,
    collidesWithObstacles: false,
    spriteProps: {
        width: 16,
        height: 16,
        weight: 0,
        maxVelocity: { x: 0, y: 0 },
    },
    behaviours: ["removed-if-energy-0", "blocks-completion"],
    paths: {
        body: {
            stroke: "#ffff80",
            lineWidth: 2,
            outlineWidth: 7,
            commands: [
                { c: "el", x: 0.5, y: 0.5, rx: 1.0, ry: 1.0 },
            ]
        }
    }
});