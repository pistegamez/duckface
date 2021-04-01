spriteTypes["living-stone"] = new SpriteType({
    id: "living-stone",
    name: "Living Stone",
    shape: SHAPES.BOX,
    resizable: true,
    collidesWithObstacles: true,
    spriteProps: {
        isObstacle: true,
        maxVelocity: { x: 1, y: 6 },//1,6
        acceleration: 0.05
    },
    behaviours: ["idles", "changes-direction-on-collision", "moves-forward-if-touched", "falls"],
    animations: {
        idle: [
            { frame: "default", s: 4 },
            { frame: "peek-1", s: 1 },
            { frame: "default", s: 0.1 },
            { frame: "peek-1", s: 1 },
            { frame: "peek-1-2", s: 2 },
            { frame: "peek-1", s: 1 },
            { frame: "default", s: 4 },
            { frame: "peek-2", s: 2 },
            { frame: "peek-2-2", s: 2 },
            { frame: "peek-2", s: 1, loop: 0 },
        ],
        move: [
            { frame: "panic" },
        ],
        "jump-up": [
            { frame: "default", x: 0.01, w: 0.98, h: 1.01 },
        ],
        "jump-down": [
            { frame: "panic", s: 0.25, x: 0.025, y: -0.05, w: 0.95, h: 1.1 },
        ],
        "jump-middle": [
            { frame: "panic", s: 0.25, x: -0.01, w: 1.02, h: 0.98 },
        ]
    },
    frames: {
        "default": [
            { path: "body" },
            { path: "mouth-shut" },
            { path: "eye1-shut" },
            { path: "eye2-shut" }
        ],
        "peek-1": [
            { path: "body" },
            { path: "mouth-shut" },
            { path: "eye1-shut" },
            { path: "eye2-open" },
            { path: "eye2-pupil" }
        ],
        "peek-1-2": [
            { path: "body" },
            { path: "mouth-shut" },
            { path: "eye1-shut" },
            { path: "eye2-open" },
            { path: "eye2-pupil", x: 0.05 }
        ],
        "peek-2": [
            { path: "body" },
            { path: "mouth-shut" },
            { path: "eye1-open" },
            { path: "eye1-pupil" },
            { path: "eye2-shut" }
        ],
        "peek-2-2": [
            { path: "body" },
            { path: "mouth-shut" },
            { path: "eye1-open" },
            { path: "eye1-pupil", x: -0.02 },
            { path: "eye2-shut" }
        ],
        "panic": [
            { path: "body" },
            { path: "mouth-open" },
            { path: "eye1-open" },
            { path: "eye1-pupil" },
            { path: "eye2-open" },
            { path: "eye2-pupil" },
        ],
    },
    paths: {
        body: {
            fill: "#d0d0d0",
            stroke: "#303030",
            commands: [{ c: "rc", l: 0.0, t: 0.0, r: 1.0, b: 1.0 }]
        },
        "eye1-shut": {
            stroke: "#303030",
            commands: [
                { c: "ar", x: 0.2, y: 0.4, r: 0.1, sa: 0.0, ea: 0.4, },

            ]
        },
        "eye1-open": {
            stroke: "#303030",
            fill: "#ffffff",
            commands: [
                { c: "ar", x: 0.2, y: 0.4, r: 0.1 },
            ]
        },
        "eye1-pupil": {
            fill: "#303030",
            commands: [
                { c: "ar", x: 0.2, y: 0.4, r: 0.02 },
            ]
        },
        "eye2-shut": {
            stroke: "#303030",
            commands: [
                { c: "ar", x: 0.85, y: 0.35, r: 0.15, sa: 0.1, ea: 0.5, },
            ]
        },
        "eye2-open": {
            stroke: "#303030",
            fill: "#ffffff",
            commands: [
                { c: "ar", x: 0.85, y: 0.35, r: 0.15 },
            ]
        },
        "eye2-pupil": {
            fill: "#303030",
            commands: [
                { c: "ar", x: 0.85, y: 0.35, r: 0.02 },
            ]
        },
        "mouth-shut": {
            fill: "#303030",
            commands: [
                { c: "el", x: 0.65, y: 0.6, rx: 0.1, ry: 0.1 },
            ]
        },
        "mouth-open": {
            fill: "#303030",
            commands: [
                { c: "el", x: 0.55, y: 0.6, rx: 0.3, ry: 0.1 },
            ]
        },
    }
});