spriteTypes.rabbit = new SpriteType({
    id: "rabbit",
    name: "Raging Rabbit",
    shape: SHAPES.BOX,
    resizable: true,
    collidesWithObstacles: true,
    collisionBox: { t: 0.0, r: 0.95, b: 1.0, l: 0.05,},
    spriteProps: {
        isEnemy: true,
        isObstacle: true,
        maxJump: 46,
        jumpPause: 100,
        maxVelocity: { x: 1, y: 6 }
    },
    patterns: {
        default: {
            behaviours: ["changes-direction-on-collision", "moves-forward", "jumps", "kills-player", "removed-if-energy-0"],
        }
    },
    animations: {
        idle: [
            { frame: "default" },
        ],
        move: [
            { frame: "default", s: 0.2 },
            { frame: "default-2", s: 0.2, w: 1.01, h: 0.96, y: 0.04, x: -0.02 },
            { frame: "default-3", s: 0.2, w: 1.02, h: 0.92, y: 0.08, x: -0.04 },
            { frame: "default-2", s: 0.2, w: 1.01, h: 0.96, y: 0.04, x: -0.02, loop: 0 },
        ],
        "jump-up": [
            { frame: "default", x: 0.01, w: 0.98, h: 1.01 },
        ],
        "jump-down": [
            { frame: "default", s: 0.25, x: 0.025, y: -0.05, w: 0.95, h: 1.1 },
        ],
        "jump-middle": [
            { frame: "default", s: 0.25, x: -0.01, w: 1.02, h: 0.98 },
        ]
    },
    frames: {
        "default": [
            { path: "teeth" },
            { path: "body" },
            { path: "mouth" },
            { path: "left-ear" },
            { path: "left-ear-fill" },
            { path: "right-ear" },
            { path: "right-ear-fill" },
            { path: "left-eye" },
            { path: "right-eye" } 
        ],
        "default-2": [
            { path: "teeth", x: 0.025 },
            { path: "body" },
            { path: "mouth", x: 0.025 },
            { path: "left-ear", x: 0.025 },
            { path: "left-ear-fill", x: 0.025 },
            { path: "right-ear", x: 0.025 },
            { path: "right-ear-fill", x: 0.025 },
            { path: "left-eye", x: 0.025 },
            { path: "right-eye", x: 0.025 }
        ],
        "default-3": [
            { path: "teeth", x: 0.05 },
            { path: "body" },
            { path: "mouth", x: 0.05 },
            { path: "left-ear", x: 0.05 },
            { path: "left-ear-fill", x: 0.05 },
            { path: "right-ear", x: 0.05 },
            { path: "right-ear-fill", x: 0.05 },
            { path: "left-eye", x: 0.035 },
            { path: "right-eye", x: 0.05 }
        ],
    },
    paths: {
        body: {
            fill: "#f8f8f8",
            stroke: "#303030",
            commands: [{ c: "rc", l: 0.0, t: 0.0, r: 1.0, b: 1.0 }]
        },
        eyes: {
            stroke: "#303030",
            lineWidth: 1,
            commands: [
                // eyes
                { c: "mt", x: 0.25, y: 0.55 },
                { c: "lt", x: 0.25, y: 0.65 },
                { c: "mt", x: 0.85, y: 0.45 },
                { c: "lt", x: 0.85, y: 0.55 },
            ]
        },
        "left-eye": {
            stroke: "#303030",
            fill: "#ff3030",
            lineWidth: 1,
            commands: [
                { c: "ar", x: 0.25, y: 0.55, r: 0.25 },
            ]
        },
        "right-eye": {
            stroke: "#303030",
            fill: "#ff3030",
            lineWidth: 1,
            commands: [
                { c: "ar", x: 0.85, y: 0.5, r: 0.15 },
            ]
        },
        "left-ear": {
            stroke: "#303030",
            fill: "#f8f8f8",
            lineWidth: 1.5,
            commands: [
                { c: "mt", x: 0.10, y: 0.05 },
                { c: "lt", x: 0.10, y: -0.3 },
                { c: "lt", x: 0.30, y: -0.3 },
                { c: "lt", x: 0.30, y: 0.05 },
            ]
        },
        "left-ear-fill": {
            stroke: "#484848",
            fill: "#e0b0b0",
            lineWidth: 1,
            commands: [
                { c: "mt", x: 0.15, y: 0.04 },
                { c: "lt", x: 0.15, y: -0.22 },
                { c: "lt", x: 0.25, y: -0.22 },
                { c: "lt", x: 0.25, y: 0.04 },
            ]
        },
        "right-ear": {
            stroke: "#303030",
            fill: "#f8f8f8",
            lineWidth: 1.5,
            commands: [
                { c: "mt", x: 0.81, y: 0.05 },
                { c: "lt", x: 0.81, y: -0.3 },
                { c: "lt", x: 0.94, y: -0.3 },
                { c: "lt", x: 0.94, y: 0.05 },
            ]
        },
        "right-ear-fill": {
            stroke: "#484848",
            fill: "#e0b0b0",
            lineWidth: 1,
            commands: [
                { c: "mt", x: 0.85, y: 0.04 },
                { c: "lt", x: 0.85, y: -0.22 },
                { c: "lt", x: 0.90, y: -0.22 },
                { c: "lt", x: 0.90, y: 0.04 },
            ]
        },
        mouth: {
            stroke: "#303030",
            fill: "#e0b0b0",
            lineWidth: 1,
            commands: [
                { c: "mt", x: 0.45, y: 0.70 },
                { c: "lt", x: 0.60, y: 0.80 },
                { c: "lt", x: 0.75, y: 0.70 },
                { c: "mt", x: 0.60, y: 0.80 },
                { c: "lt", x: 0.60, y: 1.00 },
            ]
        },
        teeth: {
            stroke: "#303030",
            fill: "#ffffff",
            lineWidth: 1.5,
            commands: [
                { c: "mt", x: 0.27, y: 1.00 },
                { c: "lt", x: 0.35, y: 1.07 },
                { c: "lt", x: 0.43, y: 1.00 },
                { c: "cp" },
                { c: "mt", x: 0.67, y: 1.00 },
                { c: "lt", x: 0.75, y: 1.07 },
                { c: "lt", x: 0.83, y: 1.00 },
                { c: "cp" }
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