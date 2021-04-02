spriteTypes["blind-duckface"] = new SpriteType({
    id: "blind-duckface",
    name: "Duckface (Blind)",
    shape: SHAPES.BOX,
    colors: ["#ffffff"],
    resizable: true,
    spriteProps: {
        maxJump: 25,
        weight: 0.25,
        isObstacle: true,
        maxVelocity: { x: 2.2, y: 6 }
    },
    patterns: {
        default: {
            behaviours: ["unfails", "idles", "looks-at-player", "jumps", "moves", "grows", "dies", "is-happy-when-completed"],
            spriteProps: {
                color: "#ffffff",
            }
        },
        happy: {
            animation: "happy",
            behaviours: ["unfails"],
        },
        dead: {
            animation: "dead",
            behaviours: [],
        }
    },
    animations: {
        idle: [
            { frame: "no-eyes" },
        ],
        move: [
            { frame: "no-eyes", s: 0.2 },
            { frame: "no-eyes-2", s: 0.2, x: -0.01, y: 0.01, w: 1.02, h: 0.99 },
            { frame: "no-eyes-3", s: 0.2, x: -0.01, y: 0.02, w: 1.02, h: 0.98 },
            { frame: "no-eyes-2", s: 0.2, x: -0.01, y: 0.01, w: 1.02, h: 0.99, loop: 0 },
        ],
        "jump-up": [
            { frame: "no-eyes", x: 0.01, w: 0.98, h: 1.01 },
        ],
        "jump-down": [
            { frame: "no-eyes", x: 0.025, y: -0.05, w: 0.95, h: 1.1 },
        ],
        "jump-middle": [
            { frame: "no-eyes", x: -0.01, w: 1.02, h: 0.98 },
        ],
        happy: [{ frame: "no-eyes" }],
        dead: [{ frame: "no-eyes" }],
        attack: [{ frame: "mouth-open" }],
        collect: [{ frame: "mouth-open" }]
    },
    frames: {
        "no-eyes": [
            { path: "body" },
            { path: "mouth" },
        ],
        "no-eyes-2": [
            { path: "body" },
            { path: "mouth", x: 0.05 },
        ],
        "no-eyes-3": [
            { path: "body" },
            { path: "mouth", x: 0.1 },
        ],        
        "mouth-open": [
            { path: "body" },
            { path: "mouth-open-inside" },
            { path: "mouth-open-beak" },
        ]
    },
    paths: {
        body: {
            fill: "sprite",
            stroke: "#303030",
            commands: [{ c: "rc", l: 0.0, t: 0.0, r: 1.0, b: 1.0 }]
        },
        mouth: {
            fill: "#ffc080",
            stroke: "#303030",
            commands: [
                { c: "mt", x: 0.25, y: 0.40 },
                { c: "lt", x: 1.10, y: 0.40 },
                { c: "lt", x: 1.10, y: 0.60 },
                { c: "lt", x: 0.25, y: 0.60 },
                { c: "cp" },
                { c: "mt", x: 0.35, y: 0.5 },
                { c: "lt", x: 1.10, y: 0.5 },
            ]
        },
        "mouth-open-beak": {
            fill: "#ffc080",
            stroke: "#303030",
            commands: [
                { c: "mt", x: 0.25, y: 0.20 },
                { c: "lt", x: 1.10, y: 0.20 },
                { c: "lt", x: 1.10, y: 0.30 },
                { c: "lt", x: 0.32, y: 0.30 },
                { c: "lt", x: 0.32, y: 0.70 },
                { c: "lt", x: 1.10, y: 0.70 },
                { c: "lt", x: 1.10, y: 0.80 },
                { c: "lt", x: 0.25, y: 0.80 },
                { c: "cp" },
                { c: "rc", l: 0.80, t: 0.3, r: 0.87, b: 0.7 },
            ]
        },
        "mouth-open-inside": {
            fill: "#303030",
            commands: [
                { c: "rc", l: 0.32, t: 0.30, r: 0.8, b: 0.7 }
            ]
        },
    }
});