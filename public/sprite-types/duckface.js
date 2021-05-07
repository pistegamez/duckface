/* eslint-disable no-undef */
spriteTypes.duckface = new SpriteType({
    id: "duckface",
    name: "Duckface",
    shape: SHAPES.BOX,
    colors: ["#ffffff"],
    resizable: true,
    spriteProps: {
        maxJump: 14,
        weight: 0.25,
        isObstacle: true,
        maxVelocity: { x: 2.2, y: 6 }
    },
    patterns: {
        "default": {
            behaviours: ["unfails", "idles", "looks-at-player", "jumps", "moves", "grows", "collects", "dies", "is-happy-when-completed"],
            spriteProps: {
                color: "#ffffff",
            }
        },
        "warmup": {
            behaviours: ["unfails", "idles", "jumps", "moves", "grows", "dies", "collects"],
            rounds: 100,
            next: "warmer",
            spriteProps: {
                color: "#ff8080",
            }
        },
        "warmer": {
            behaviours: ["unfails", "idles", "jumps", "moves", "grows", "dies", "sweats", "collects"],
            rounds: 100,
            next: "fire",
            spriteProps: {
                color: "#ff0000",
            }
        },        
        "fire": {
            behaviours: ["unfails", "idles", "jumps", "moves", "grows", "dies", "sweats", "shoots-fireball"],
            rounds: 100,
            next: "default",
            spriteProps: {
                reloadCounter: 0,
                color: "#ff8080",
                fireBallSize: 20
            }
        },
        "dead": {
            animation: "dead",
            behaviours: []
        },
        "happy": {
            animation: "happy",
            behaviours: ["unfails", "grows"]
        }
    },
    animations: {
        idle: [
            { frame: "eyes-open", s: 3 },
            { frame: "eyes-closed", s: 0.2 },
            { frame: "eyes-open", s: 4 },
            { frame: "eyes-closed", s: 0.1 },
            { frame: "eyes-open", s: 0.1 },
            { frame: "eyes-closed", s: 0.1, loop: 0 },
        ],
        move: [
            { frame: "eyes-open", s: 0.2 },
            { frame: "eyes-open-2", s: 0.2, x: -0.01, y: 0.01, w: 1.02, h: 0.99 },
            { frame: "eyes-open-3", s: 0.2, x: -0.01, y: 0.02, w: 1.02, h: 0.98 },
            { frame: "eyes-open-2", s: 0.2, x: -0.01, y: 0.01, w: 1.02, h: 0.99, loop: 0 },
        ],
        "jump-up": [
            { frame: "eyes-open", x: 0.01, w: 0.98, h: 1.01 },
        ],
        "jump-down": [
            { frame: "eyes-open", x: 0.025, y: -0.05, w: 0.95, h: 1.1 },
        ],
        "jump-middle": [
            { frame: "eyes-open", x: -0.01, w: 1.02, h: 0.98 },
        ],
        happy: [{ frame: "eyes-closed" }],
        dead: [{ frame: "dead" }],
        attack: [{ frame: "mouth-open" }],
        collect: [
            { frame: "mouth-open", s: 0.1 },
            { frame: "eyes-open", s: 0.1, loop: 0 }
        ]
    },
    frames: {
        "eyes-open": [
            { path: "body" },
            { path: "mouth" },
            { path: "eyes-open" }
        ],
        "eyes-open-2": [
            { path: "body" },
            { path: "mouth", x: 0.05 },
            { path: "eyes-open", x: 0.05 }
        ],
        "eyes-open-3": [
            { path: "body" },
            { path: "mouth", x: 0.1 },
            { path: "eyes-open", x: 0.1 }
        ],
        "eyes-closed": [
            { path: "body" },
            { path: "mouth" },
            { path: "eyes-closed" }
        ],
        "dead": [
            { path: "body" },
            { path: "mouth" },
            { path: "eyes-x" }
        ],
        "mouth-open": [
            { path: "body" },
            { path: "mouth-open-inside" },
            { path: "mouth-open-beak" },
            { path: "eyes-mouth-open" }
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
        "eyes-open": {
            stroke: "#303030",
            lineWidth: 1,
            commands: [
                { c: "mt", x: 0.15, y: 0.3 },
                { c: "lt", x: 0.15, y: 0.35 },
                { c: "mt", x: 0.85, y: 0.25 },
                { c: "lt", x: 0.85, y: 0.3 },

            ]
        },
        "eyes-closed": {
            stroke: "#303030",
            commands: [
                { c: "ar", x: 0.13, y: 0.33, r: 0.05, sa: 0.0, ea: 0.5, },
                { c: "mt", x: 0.86, y: 0.28 },
                { c: "ar", x: 0.83, y: 0.28, r: 0.05, sa: 0.0, ea: 0.5, },

            ]
        },
        "eyes-mouth-open": {
            stroke: "#303030",
            lineWidth: 2,
            commands: [
                { c: "mt", x: 0.15, y: 0.3 },
                { c: "lt", x: 0.15, y: 0.35 },
                { c: "mt", x: 0.85, y: 0.1 },
                { c: "lt", x: 0.85, y: 0.15 },

            ]
        },
        "eyes-x": {
            stroke: "#303030",
            lineWidth: 1,
            commands: [
                { c: "mt", x: 0.11, y: 0.28 },
                { c: "lt", x: 0.20, y: 0.37 },
                { c: "mt", x: 0.20, y: 0.28 },
                { c: "lt", x: 0.11, y: 0.37 },

                { c: "mt", x: 0.90, y: 0.23 },
                { c: "lt", x: 0.81, y: 0.32 },
                { c: "mt", x: 0.81, y: 0.23 },
                { c: "lt", x: 0.90, y: 0.32 },
            ]
        }
    }
});