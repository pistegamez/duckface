/* eslint-disable no-undef */
// eslint-disable-next-line no-undef
spriteTypes.wind = new SpriteType({
  id: "wind",
  name: "Wind",
  shape: SHAPES.BOX,
  resizable: true,
  shaded: false,
  collidesWithObstacles: true,
  movedByOtherSprites: false,
  availableInEditor: false,
  collisionBoxes: [
    { t: 0, l: 0, r: 1, b: 1, testSprites: true, testTiles: false },
    { t: 0.4, l: 0.2, r: 0.8, b: 0.6, testSprites: false, testTiles: true },
  ],
  spriteProps: {
    isObstacle: false,
    weight: 0,
  },
  isDamagedBy: [DAMAGE_TYPES.FIRE],
  behaviours: ["wind"],
  animations: {
    blow: [
      { frame: "blow", x: 0.3, y: 0.3, w: 0.4, h: 0.4, s: 0.05 },
      { frame: "blow", x: 0.2, y: 0.2, w: 0.6, h: 0.6, s: 0.05 },
      { frame: "blow", x: 0.1, y: 0.1, w: 0.8, h: 0.8, s: 0.05 },
      { frame: "blow", x: 0, y: 0, w: 1, h: 1, s: 0.1, loop: 2 },
    ],
    fade: [
      { frame: "blow", x: 0.1, y: 0.1, w: 0.8, h: 0.8, s: 0.1 },
      { frame: "blow", x: 0.2, y: 0.2, w: 0.6, h: 0.6, s: 0.05 },
      { frame: "blow", x: 0.3, y: 0.3, w: 0.4, h: 0.4, s: 0.05 },
      { frame: "blow", x: 0.4, y: 0.4, w: 0.2, h: 0.2 },
    ],
  },
  frames: {
    blow: [{ path: "body" }],
  },
  paths: {
    body: {
      fill: "rgba(255,255,255,0.8)",
      commands: [
        { c: "ar", x: 0.25, y: 0.25, r: 0.5 },
        { c: "cp" },
        { c: "ar", x: 0.65, y: 0.25, r: 0.5 },
        { c: "cp" },
        { c: "ar", x: 0.8, y: 0.35, r: 0.45 },
        { c: "cp" },
        { c: "ar", x: 0.7, y: 0.65, r: 0.6 },
        { c: "cp" },
        { c: "ar", x: 0.3, y: 0.65, r: 0.6 },
        { c: "cp" },
      ],
    },
    /*
    blows: {
      lineWidth: 1,
      stroke: "rgba(64,64,64,0.2)",
      commands: [
        { c: "mt", x: -0.2, y: 0.35 },
        { c: "lt", x: 0.2, y: 0.35 },

        { c: "mt", x: -0.2, y: 0.5 },
        { c: "lt", x: 0.2, y: 0.5 },

        { c: "mt", x: -0.2, y: 0.65 },
        { c: "lt", x: 0.2, y: 0.65 },

      ],
    }, */
  },
});
