spriteTypes.fireball = new SpriteType({
    id: "fireball",
    name: "Fire Ball",
    shape: SHAPES.BOX,
    resizable: true,
    shaded: false,
    collidesWithObstacles: true,
    movedByOtherSprites: false,
    damageType: DAMAGE_TYPES.FIRE,
    availableInEditor: false,
    spriteProps: {
        isObstacle: false,
    },
    behaviours: ["fireball"],
    animations: {
        idle: [
            { frame: "flame-1" },
        ],
    },
    frames: {
        "flame-1": [
            { path: "flame" }
        ],
    },
    paths: {
        "flame": {
            lineWidth: 4,
            fill: "#ffffff",
            stroke: "#ffe000",
            /*
            commands: [
                { c: "mt", x: 1.0, y: 0.5 },
                { c: "lt", x: 0.7, y: 1.0 },
                { c: "lt", x: 0.2, y: 0.75 },
                { c: "lt", x: 0.3, y: 0.7 },
                { c: "lt", x: 0.0, y: 0.5 },
                { c: "lt", x: 0.7, y: 0.0 },
                { c: "cp" }
            ]*/
            commands: [
                { c: "mt", x: 0.5, y: 0.0 },
                { c: "lt", x: 1.0, y: 0.5 },
                { c: "lt", x: 0.5, y: 1.0 },
                { c: "lt", x: 0.0, y: 0.5 },
                { c: "cp" }
            ]
        },
    }
});