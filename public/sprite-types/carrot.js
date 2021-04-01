spriteTypes["carrot"] = new SpriteType({
    id: "carrot",
    name: "Carrot",
    shape: SHAPES.BOX,
    shaded: false,
    resizable: true,
    collectable: true,
    collidesWithObstacles: false,
    spriteProps: {
        weight: 0,
        maxVelocity: { x: 0, y: 0 }
    },
    behaviours: ["removed-if-energy-0", "throttle-players-max-jump", "blocks-completion"],
    paths: {
        stem: {
            stroke: "#309030",
            lineWidth: 4,
            commands: [
                { c: "mt", x:  0.45, y: 0 },
                { c: "lt", x:  0.4, y: -0.2 },
                { c: "mt", x:  0.5, y: 0 },
                { c: "lt", x:  0.5, y: -0.3 },
                { c: "mt", x:  0.55, y: 0 },
                { c: "lt", x:  0.6, y: -0.1 },
            ]
        },
        body: {
            fill: "#ff8030",
            stroke: "#303030",
            commands: [
                { c: "mt", x:  0.0, y: 0.1 },
                { c: "qc", x:  1.0, y: 0.1, cpx: 0.5, cpy: -0.1 },
                { c: "lt", x:  0.5, y: 1.0 },
                { c: "cp" },
            ]
        },
        lines: {
            stroke: "#806030",
            lineWidth: 1,
            commands: [
                { c: "mt", x: 0.15, y: 0.3 },
                { c: "qc", x: 0.45, y: 0.22, cpx: 0.3, cpy: 0.22 },
                { c: "mt", x: 0.55, y: 0.55 },
                { c: "qc", x: 0.7, y: 0.58, cpx: 0.65, cpy: 0.56 }

            ]
        }
    }
});