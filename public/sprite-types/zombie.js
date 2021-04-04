spriteTypes.zombie = new SpriteType({
    id: "zombie",
    name: "Zombie",
    shape: SHAPES.BOX,
    resizable: true,
    collidesWithObstacles: true,
    //collisionBox: { t: 0.05, r: 0.95, b: 1.0, l: 0.05},
    collisionBox: { t: 0.1, r: 0.95, b: 1.0, l: 0.05},
    spriteProps: {
        isEnemy: true,
        isObstacle: true,
        maxVelocity: { x: 1, y: 6 },
        acceleration: 0.2
    },
    maxVelocity: { x: 1, y: 6 },
    patterns: {
        default: {
            behaviours: ["changes-direction-on-collision", "moves-forward", "changes-players-type", "is-happy-when-completed", "removed-if-energy-0"],
        },
        happy: {
            animation: "happy",
            behaviours: [],
        }
    },
    animations: {
        idle: [
            { frame: "default" },
        ],
        move: [
            { frame: "default", s: 0.2 },
            { frame: "default-2", s: 0.2, w: 1.05, h: 0.95, y: 0.05, x: -0.025 },
            { frame: "default-3", s: 0.2, w: 1.1, h: 0.9, y: 0.1, x: -0.05 },
            { frame: "default-2", s: 0.2, w: 1.05, h: 0.95, y: 0.05, x: -0.025, loop: 0 },
        ],
        "jump-up": [
            { frame: "default", x: 0.01, w: 0.98, h: 1.01 },
        ],
        "jump-down": [
            { frame: "default", s: 0.25, x: 0.025, y: -0.05, w: 0.95, h: 1.1 },
        ],
        "jump-middle": [
            { frame: "default", s: 0.25, x: -0.01, w: 1.02, h: 0.98 },
        ],
        happy: [{ frame: "happy" }],
    },
    frames: {
        "default": [
            { path: "body" },
            { path: "mouth" },
            { path: "teeth" },
            { path: "eyes" }
        ],
        "default-2": [
            { path: "body" },
            { path: "mouth" },
            { path: "teeth", x: 0.025 },
            { path: "eyes", x: 0.025 }
        ],
        "default-3": [
            { path: "body" },
            { path: "mouth" },
            { path: "teeth", x: 0.05 },
            { path: "eyes", x: 0.05 }
        ],
        "happy": [
            { path: "body" },
            { path: "smile" },
            { path: "teeth" },
            { path: "eyes" }
        ]
    },
    paths: {
        body: {
            fill: "#55ff55",
            stroke: "#303030",
            commands: [{ c: "rc", l: 0.0, t: 0.0, r: 1.0, b: 1.0 }]
        },
        eyes: {
            stroke: "#303030",
            lineWidth: 1,
            commands: [
                // eyes
                { c: "mt", x: 0.25, y: 0.3 },
                { c: "lt", x: 0.35, y: 0.40 },
                { c: "mt", x: 0.35, y: 0.3 },
                { c: "lt", x: 0.25, y: 0.40 },

                { c: "mt", x: 0.90, y: 0.25 },
                { c: "lt", x: 0.80, y: 0.35 },
                { c: "mt", x: 0.80, y: 0.25 },
                { c: "lt", x: 0.90, y: 0.35 },
            ]
        },
        teeth: {
            stroke: "#303030",
            lineWidth: 1,
            commands: [
                { c: "mt", x: 0.65, y: 0.45 },
                { c: "lt", x: 0.65, y: 0.55 },
                { c: "mt", x: 0.50, y: 0.45 },
                { c: "lt", x: 0.50, y: 0.55 },
                { c: "mt", x: 0.80, y: 0.45 },
                { c: "lt", x: 0.80, y: 0.55 },
            ]
        },
        mouth: {
            stroke: "#303030",
            lineWidth: 1,
            commands: [
                { c: "mt", x: 0.25, y: 0.5 },
                { c: "lt", x: 1.00, y: 0.5 },
            ]
        },
        smile: {
            stroke: "#303030",
            lineWidth: 1,
            commands: [
                { c: "mt", x: 0.15, y: 0.45 },
                { c: "qc", x: 1.00, y: 0.5, cpx: 0.4, cpy: 0.5 },
            ]
        }
    }
});