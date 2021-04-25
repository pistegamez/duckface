spriteTypes["elevator-vertical"] = new SpriteType({
    id: "elevator-vertical",
    name: "Elevator (Vertical)",
    collisionBoxes: [
        { 
            shape: SHAPES.BOX,
            t: 0,
            r: 1,
            b: 0.2,
            l: 0 
        },
        { 
            shape: SHAPES.BOX,
            t: 0.8,
            r: 1,
            b: 1,
            l: 0
        }
    ],
    resizable: true,
    collidesWithObstacles: true,
    spriteProps: {
        isObstacle: true,
        isElevator: true,
        weight: 0,
        maxVelocity: { x: 0, y: 1 },
    },
    behaviours: ["changes-vertical-direction-on-tile-collision", "moves-upward", "is-x-locked"],
    paths: {
        "left-bar": {
            fill: "#b0b0b0",
            stroke: "#707070",
            commands: [{ c: "rc", l: 0.1, t: 0.2, r: 0.2, b: 0.8 }]
        },
        "bottom-bar": {
            fill: "#b0b0b0",
            stroke: "#707070",
            commands: [{ c: "rc", l: 0.2, t: 0.6, r: 0.8, b: 0.8 }]
        },
        "right-bar": {
            fill: "#b0b0b0",
            stroke: "#707070",
            commands: [{ c: "rc", l: 0.8, t: 0.2, r: 0.9, b: 0.8 }]
        },
        "top-bar": {
            fill: "#b0b0b0",
            stroke: "#707070",
            commands: [{ c: "rc", l: 0.2, t: 0.2, r: 0.8, b: 0.3 }]
        },
        "grid": {
            stroke: "#707070",
            commands: [
                { c: "mt", x: 0.4, y: 0.3 },
                { c: "lt", x: 0.4, y: 0.6 },
                { c: "mt", x: 0.6, y: 0.3 },
                { c: "lt", x: 0.6, y: 0.6 },
                { c: "mt", x: 0.2, y: 0.4 },
                { c: "lt", x: 0.8, y: 0.4 },
                { c: "mt", x: 0.2, y: 0.5 },
                { c: "lt", x: 0.8, y: 0.5 },
            ]
        },
        top: {
            fill: "#d0d0d0",
            stroke: "#303030",
            commands: [{ c: "rc", l: 0.0, t: 0.0, r: 1.0, b: 0.2 }]
        },
        bottom: {
            fill: "#d0d0d0",
            stroke: "#303030",
            commands: [{ c: "rc", l: 0.0, t: 0.8, r: 1.0, b: 1.0 }]
        }
    }
});