spriteTypes.key = new SpriteType({
    id: "key",
    name: "Key",
    shape: SHAPES.BOX,
    resizable: false,
    shaded: false,
    collectable: true,
    collisionBox: { t: 0.0, r: 0.7, b: 1.0, l: 0.3, },
    spriteProps: {
        weight: 0.25,
        isKey: true,
        width: 32,
        height: 32,
        isObstacle: true
    },
    behaviours: ["blocks-completion", "removed-if-energy-0"],
    paths: {
        inline: {
            lineWidth: 2,
            outlineWidth: 6,
            stroke: "#ffff80",
            commands: [
                { c: "ar", x: 0.5, y: 0.25, r: 0.5 },
                { c: "mt", x: 0.5, y: 0.5 },
                { c: "lt", x: 0.5, y: 0.99 },
                { c: "mt", x: 0.5, y: 0.8 },
                { c: "lt", x: 0.64, y: 0.8 },
                { c: "mt", x: 0.5, y: 0.9 },
                { c: "lt", x: 0.67, y: 0.9 },
            ]
        }
    }
});