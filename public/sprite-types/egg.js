/* eslint-disable no-undef */
spriteTypes.egg = new SpriteType({
  id: "egg",
  name: "Eggface",
  shape: SHAPES.BOX,
  collidesWithObstacles: true,
  resizable: true,
  spriteProps: {
    role: ROLES.FRIEND,
    weight: 0.25,
    isObstacle: true,
    maxVelocity: { x: 2.2, y: 6 },
    transform: {
      typeId: "duckface",
      color: "#ffff40",
    },
  },
  damage: 1,
  damageType: DAMAGE_TYPES.EAT,
  attackAnimation: "eat",
  dyingEffect: {
    // sound: "collect",
    particleType: "star",
    particles: 10,
  },
  patterns: {
    default: {
      behaviours: [
        "unfails",
        "idles",
        "dies-if-falls",
        "jumps",
        "moves",
        "grows",
        "collects",
        "dies",
        "changes-type-when-completed",
        "is-happy-when-completed",
      ],
    },
    happy: {
      behaviours: ["unfails"],
    },
    dead: {
      animation: "dead",
      behaviours: ["fails"],
    },
  },
  animations: {
    idle: [{ frame: "egg" }],
    move: [
      { frame: "egg", s: 0.2 },
      { frame: "egg", s: 0.2, x: -0.01, y: 0.01, w: 1.02, h: 0.99 },
      { frame: "egg", s: 0.2, x: -0.01, y: 0.02, w: 1.02, h: 0.98 },
      { frame: "egg", s: 0.2, x: -0.01, y: 0.01, w: 1.02, h: 0.99, loop: 0 },
    ],
    "jump-up": [{ frame: "egg", x: 0.01, w: 0.98, h: 1.01 }],
    "jump-down": [
      { frame: "egg", s: 0.25, x: 0.025, y: -0.05, w: 0.95, h: 1.1 },
    ],
    "jump-middle": [{ frame: "egg", s: 0.25, x: -0.01, w: 1.02, h: 0.98 }],
    happy: [{ frame: "cracked" }],
    dead: [{ frame: "cracked" }],
  },
  frames: {
    egg: [{ path: "body" }],
    cracked: [{ path: "body" }, { path: "crack" }],
  },
  paths: {
    body: {
      fill: "#ffffff",
      stroke: "#303030",
      commands: [{ c: "rc", l: 0.0, t: 0.0, r: 1.0, b: 1.0 }],
    },
    crack: {
      stroke: "#303030",
      commands: [
        { c: "mt", x: 0.5, y: 0.0 },
        { c: "lt", x: 0.25, y: 0.2 },
        { c: "lt", x: 0.65, y: 0.4 },
        { c: "lt", x: 0.7, y: 0.6 },
      ],
    },
  },
});
