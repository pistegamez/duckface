/* eslint-disable no-undef */
"use strict";

// Do not remove these comments, they are used in build
// scripts-start
importScripts("/js/common.js");
importScripts("/js/behaviours.js");
// scripts-end

const ROUNDS_PER_SECOND = 80;
const ROUND_MAX_TIMEOUT_MS = Math.floor(1000 / ROUNDS_PER_SECOND);
const REPORT_FREQUENCY_MS = Math.floor(ROUND_MAX_TIMEOUT_MS / 2);

const statistics = {
  rounds: 0,
  ms: 0,
};

setInterval(() => {
  statistics.rounds = 0;
  statistics.ms = 0;
}, 1000);

let optimizeTiles = true;

let state = {};
const mode = {
  pause: false,
  run: false,
};
let nextState = {};

let scene = new Scene({});
let tiles = [];
let sprites = [];

const controls = {
  up: false,
  right: false,
  down: false,
  left: false,
};

const recording = {
  frame: 0,
  actions: [],
  on: false,
  replaying: false,
  startRecording() {
    this.on = true;
    this.frame = 0;
    this.actions = {};
    this.replaying = false;
  },
  stopRecording() {
    this.on = false;
    // console.log(this.actions);
    postMessage({
      type: "RECORDING_DONE",
      actions: recording.actions,
      frames: recording.frames,
    });
  },
  record(action) {
    if (this.on) {
      if (this.actions[this.frame]) {
        this.actions[this.frame] += "," + action;
      } else {
        this.actions[this.frame] = action;
      }
    }
    // console.log(this.frame + " " + action);
  },
  loadRecording(actions) {
    this.frame = 0;
    this.actions = actions;
  },
  rewind() {
    this.frame = 0;
  },
  startReplay() {
    this.frame = 0;
    this.replaying = true;
  },
  replay() {
    if (this.actions[this.frame]) {
      this.actions[this.frame].split(",").forEach((command) => {
        switch (command) {
          case "<":
            controls.left = true;
            break;
          case "^":
            controls.up = true;
            break;
          case ">":
            controls.right = true;
            break;
          case "<.":
            controls.left = false;
            break;
          case "^.":
            controls.up = false;
            break;
          case ">.":
            controls.right = false;
            break;
          default:
            break;
        }
      });
    }
  },
};

onmessage = ({ data }) => {
  // onsole.log(data.action);

  if (data.action === "SET_SCENE") {
    controls.left = false;
    controls.right = false;
    controls.up = false;
    controls.down = false;
    tiles = [];
    sprites = [];
    state = {};
    // eslint-disable-next-line no-undef
    scene = new Scene(data.scene);

    addSpriteTypes(data.spriteTypes);

    data.scene.sprites.forEach((sprite) => {
      addSprite(sprite);
    });

    setTiles(data.scene.tiles);
  } else if (data.action === "REPLAY") {
    mode.run = true;
    recording.loadRecording(data.recordedActions);
    recording.startReplay();
  } else if (data.action === "RUN") {
    mode.run = true;
    recording.startRecording();
  } else if (data.action === "STOP") {
    mode.run = false;
  } else if (
    mode.run &&
    data.action === "START_CONTROL_UP" &&
    !recording.replaying
  ) {
    if (!controls.up) {
      recording.record("^");
    }
    controls.up = true;
  } else if (
    mode.run &&
    data.action === "START_CONTROL_RIGHT" &&
    !recording.replaying
  ) {
    if (!controls.right) {
      recording.record(">");
    }
    controls.right = true;
  } else if (
    mode.run &&
    data.action === "START_CONTROL_DOWN" &&
    !recording.replaying
  ) {
    controls.down = true;
  } else if (
    mode.run &&
    data.action === "START_CONTROL_LEFT" &&
    !recording.replaying
  ) {
    if (!controls.left) {
      recording.record("<");
    }
    controls.left = true;
  } else if (
    mode.run &&
    data.action === "STOP_CONTROL_UP" &&
    !recording.replaying
  ) {
    if (controls.up) {
      recording.record("^.");
    }
    controls.up = false;
  } else if (
    mode.run &&
    data.action === "STOP_CONTROL_RIGHT" &&
    !recording.replaying
  ) {
    if (controls.right) {
      recording.record(">.");
    }
    controls.right = false;
  } else if (
    mode.run &&
    data.action === "STOP_CONTROL_DOWN" &&
    !recording.replaying
  ) {
    controls.down = false;
  } else if (
    mode.run &&
    data.action === "STOP_CONTROL_LEFT" &&
    !recording.replaying
  ) {
    if (controls.left) {
      recording.record("<.");
    }
    controls.left = false;
  } else if (data.action === "ADD_TILE") {
    addTile(data.tile, tiles);
  } else if (data.action === "ADD_SPRITE") {
    addSprite(data.sprite);
  } else if (data.action === "DELETE") {
    tiles = tiles.filter((tile) => !data.tileIds.includes(tile.id));
    sprites = sprites.filter((sprite) => !data.spriteIds.includes(sprite.id));
  } else if (data.action === "UPDATE") {
    setTiles(data.tiles);
    if (data.sprites) {
      data.sprites.forEach((sprite) => {
        const index = sprites.findIndex((s) => s.id === sprite.id);
        sprites[index] = new Sprite(sprite);
      });
    }
  } else if (data.action === "PAUSE_ON") {
    mode.pause = true;
  } else if (data.action === "PAUSE_OFF") {
    mode.pause = false;
  } else if (data.action === "DISABLE_OPTIMIZATIONS") {
    optimizeTiles = false;
  }
};

function mainloop() {
  const startMs = Date.now();

  if (!mode.pause && mode.run) {
    if (recording.replaying) {
      recording.replay();
    }

    nextState = {
      completed: true,
      failed: true,
      forceFail: false,
    };

    move();
    collide();
    animate();

    if (nextState.forceFail === true) {
      nextState.failed = true;
      nextState.completed = false;
    }

    state = nextState;

    if (recording.on) {
      if (state.completed || state.failed) {
        recording.stopRecording();
      }
    }

    recording.frame++;
  }

  sendData();

  statistics.rounds++;
  const delta = Date.now() - startMs;
  statistics.ms += delta;

  setTimeout(mainloop, Math.max(0, ROUND_MAX_TIMEOUT_MS - delta));
}

mainloop();

function sendData() {
  postMessage({
    type: "STATUS",
    sprites,
    state,
    mode,
    statistics,
  });
}

function animate() {
  sprites.forEach((sprite) => {
    sprite.animate(ROUNDS_PER_SECOND);
  });
}

function move() {
  let removeSprites = false;

  sprites.forEach((sprite) => {
    const type = spriteTypes[sprite.typeId];

    if (sprite.width <= 0 || sprite.height <= 0) {
      sprite.remove = true;
    }

    if (sprite.velocity.x <= 0.01 && sprite.velocity.x >= -0.01) {
      sprite.velocity.x = 0;
    }
    if (sprite.velocity.y <= 0.005 && sprite.velocity.y >= -0.005) {
      sprite.velocity.y = 0;
    }

    type.behave({ sprite, sprites, tiles, state, nextState });

    sprite.velocity.x = Math.min(sprite.velocity.x, sprite.maxVelocity.x);
    sprite.velocity.x = Math.max(sprite.velocity.x, -sprite.maxVelocity.x);
    sprite.velocity.y = Math.min(sprite.velocity.y, sprite.maxVelocity.y);
    sprite.velocity.y = Math.max(sprite.velocity.y, -sprite.maxVelocity.y);

    if (sprite.freezeCounter === 0 && !sprite.isStatic) {
      if (sprite.collisionData.bottom) {
        if (sprite.collisionData.tileIds.size === 0) {
          sprite.velocity.x *= 0.95;
        } else {
          let inertia = 1;
          sprite.collisionData.tileIds.forEach((tileId) => {
            const tile = tiles.find((tile) => tile.id === tileId);
            if (tile) {
              inertia = Math.min(
                inertia,
                tileMaterials[tile.materialId].inertia
              );
            }
          });
          sprite.velocity.x *= inertia;
        }
      } else {
        if (sprite.velocity.x > 0) {
          sprite.velocity.x -= sprite.velocity.x / 150;
        } else if (sprite.velocity.x < 0) {
          sprite.velocity.x -= sprite.velocity.x / 150;
        }
      }

      if (!sprite.collisionData.bottom && sprite.weight > 0) {
        sprite.velocity.y += sprite.weight;
      }

      sprite.x += sprite.velocity.x;
      sprite.y += sprite.velocity.y;

      if (scene.verticalLoop) {
        if (sprite.y + sprite.height >= scene.bottom) {
          sprite.y -= scene.height;
        } else if (sprite.y <= scene.top) {
          sprite.y += scene.height;
        }
      }

      if (scene.horizontalLoop) {
        if (sprite.x + sprite.width >= scene.right) {
          sprite.x -= scene.width;
        } else if (sprite.x <= scene.left) {
          sprite.x += scene.width;
        }
      }

      /*
             if (scene.verticalLoop) {
                 if (sprite.y + sprite.height >= scene.bottom) {
                     sprite.y -= scene.height;
                 }
                 else if (sprite.y <= scene.top) {
                     sprite.y += scene.height;
                 }
             }
 
             if (scene.horizontalLoop) {
                 if (sprite.x >= scene.right) {
                     sprite.x -= scene.width;
                 }
                 else if (sprite.x + sprite.width <= scene.left) {
                     sprite.x += scene.width;
                 }
             }
             */

      sprite.velocity.y = Math.floor(sprite.velocity.y * 10) / 10;

      if (sprite.damageCounter > 0) {
        sprite.damageCounter--;
      }

      if (sprite.remove) {
        removeSprites = true;
      }
    } else {
      sprite.freezeCounter--;
    }
  });

  if (removeSprites) {
    sprites = sprites.filter((sprite) => !sprite.remove);
  }
}

function collide() {
  tiles.forEach((tile) => {
    tile.collision = false;
  });

  sprites.forEach((sprite) => {
    sprite.resetCollisionData();
    sprite.resetCollisionBoxes(scene);
  });

  sprites.forEach((sprite) => {
    if (!sprite.hidden) {
      sprite.collision = false;
      testCollisions(
        sprite,
        sprites.filter((sprite) => !sprite.hidden)
      );
    }
  });

  sprites.forEach((sprite) => {
    if (!sprite.hidden) {
      sprite.x = sprite.x + sprite.collisionData.xChange;
      sprite.y = sprite.y + sprite.collisionData.yChange;
      sprite.resetCollisionBoxes(scene);
      sprite.collisionData.yChange = 0;
      sprite.collisionData.tileIds.clear();

      testCollisions(sprite, tiles);

      sprite.x += sprite.collisionData.xChange;
      sprite.y = Math.floor(sprite.y + sprite.collisionData.yChange);
      sprite.velocity.x = sprite.collisionData.velocity.x;
      sprite.velocity.y = sprite.collisionData.velocity.y;
    }
  });
}

function testCollisions(sprite, targets) {
  let rounds = 9;
  let collision = null;
  let slopeCollision = false;

  do {
    collision = null;

    for (let i = 0; i < targets.length && !slopeCollision; i++) {
      const target = targets[i];

      if (sprite === target) {
        continue;
      }

      if (target.isSprite && sprite.collisionData.spriteIds.has(target.id)) {
        continue;
      }

      if (target.isTile && sprite.collisionData.tileIds.has(target.id)) {
        continue;
      }

      sprite.collisionData.boxes.forEach((collisionBox) => {
        if (target.isSprite && collisionBox.testSprites) {
          target.collisionData.boxes
            .filter((box) => box.testSprites)
            .forEach((targetCollisionBox) => {
              if (
                collisionBox.shape === SHAPES.BOX &&
                targetCollisionBox.shape === SHAPES.BOX
              ) {
                if (checkBoxToBoxCollision(collisionBox, targetCollisionBox)) {
                  if (
                    target.isObstacle &&
                    spriteTypes[sprite.typeId].collidesWithObstacles &&
                    spriteTypes[sprite.typeId].movedByOtherSprites
                  ) {
                    const area = calculatePenetrationArea(
                      collisionBox,
                      targetCollisionBox
                    );

                    if (collision === null || collision.area.size < area.size) {
                      collision = {
                        target,
                        area,
                        collisionBox,
                        targetShape: targetCollisionBox.shape,
                      };
                    }
                  } else {
                    sprite.collisionData.spriteIds.add(target.id);

                    if (target.isPlayer) {
                      sprite.collisionData.playerHits++;
                    }

                    if (target.isEnemy) {
                      sprite.collisionData.enemyHits++;
                    }
                  }
                }
              } else if (
                collisionBox.shape === SHAPES.BOX &&
                targetCollisionBox.shape === SHAPES.CIRCLE
              ) {
                if (
                  checkBoxToCircleCollision(collisionBox, targetCollisionBox)
                ) {
                  sprite.collisionData.spriteIds.add(target.id);

                  if (target.isPlayer) {
                    sprite.collisionData.playerHits++;
                  }

                  if (target.isEnemy) {
                    sprite.collisionData.enemyHits++;
                  }
                }
              } else if (
                collisionBox.shape === SHAPES.CIRCLE &&
                targetCollisionBox.shape === SHAPES.BOX
              ) {
                if (
                  checkBoxToCircleCollision(targetCollisionBox, collisionBox)
                ) {
                  sprite.collisionData.spriteIds.add(target.id);

                  if (target.isPlayer) {
                    sprite.collisionData.playerHits++;
                  }
                  if (target.isEnemy) {
                    sprite.collisionData.enemyHits++;
                  }
                }
              }
            });
        }
        // TODO: circle shaped sprite vs tile
        else if (
          target.isTile &&
          collisionBox.testTiles &&
          spriteTypes[sprite.typeId].collidesWithObstacles &&
          collisionBox.shape === SHAPES.BOX
        ) {
          if (
            (target.shape === SHAPES.BOX || target.shape === SHAPES.TOP_DOWN) &&
            checkBoxToBoxCollision(collisionBox, target)
          ) {
            const area = calculatePenetrationArea(collisionBox, target);
            if (collision === null || collision.area.size < area.size) {
              collision = {
                target,
                area,
                collisionBox,
                targetShape: target.shape,
              };
            }
          } else if (
            target.shape === SHAPES.SLOPE_LEFT ||
            target.shape === SHAPES.SLOPE_RIGHT
          ) {
            if (checkBoxMiddleToBoxCollision(collisionBox, target)) {
              if (checkBoxToSlopeCollision(collisionBox, target)) {
                const area = calculateSlopePenetrationArea(
                  collisionBox,
                  target
                );
                collision = {
                  target,
                  area,
                  collisionBox,
                  targetShape: target.shape,
                };
              }
              rounds = 0;
              slopeCollision = true;
            }
          }
        }
      });
    }

    if (collision !== null) {
      sprite.collision = true;
      sprite.collisionArea = collision.area;

      if (collision.target.isSprite) {
        sprite.collisionData.spriteIds.add(collision.target.id);
        if (collision.target.isPlayer) {
          sprite.collisionData.playerHits++;
        }
        if (collision.target.isEnemy) {
          sprite.collisionData.enemyHits++;
        }
      } else if (collision.target.isTile) {
        sprite.collisionData.tileIds.add(collision.target.id);
      }

      if (sprite.isStatic) {
      } else if (collision.targetShape === SHAPES.TOP_DOWN) {
        if (
          sprite.velocity.y >= -0.5 &&
          collision.collisionBox.b - 6.5 <= collision.target.y
        ) {
          sprite.collisionData.bottom = true;

          sprite.collisionData.yChange = Math.min(
            sprite.collisionData.yChange,
            -Math.round(collision.area.height)
          );

          if (sprite.velocity.y >= 3) {
            sprite.collisionData.velocity.y = Math.min(
              -sprite.velocity.y / 4,
              sprite.collisionData.velocity.y
            );
            sprite.collisionData.bounce = true;
            postMessage({
              type: "PLAY_SOUND",
              sound: "bump",
              x: sprite.x + sprite.width / 2,
              y: sprite.y + sprite.height / 2,
            });
            postMessage({
              type: "EMIT_PARTICLES",
              particleTypeId: "dust",
              amount: 5,
              particleProps: {
                x: sprite.x + sprite.width / 2,
                y: sprite.y + sprite.height,
                energy: sprite.velocity.y / 6,
                velocity: {
                  x: sprite.velocity.x / 2,
                  y: 0,
                },
              },
            });
          } else if (sprite.velocity.y > 0) {
            sprite.collisionData.velocity.y = Math.min(
              0,
              sprite.collisionData.velocity.y
            );
            sprite.collisionData.bounce = true;
          }
        }
      } else if (collision.area.width > collision.area.height) {
        if (
          collision.collisionBox.t < collision.area.top ||
          collision.targetShape === SHAPES.SLOPE_LEFT ||
          collision.targetShape === SHAPES.SLOPE_RIGHT
        ) {
          sprite.collisionData.bottom = true;

          if (collision.target.isSprite) {
            sprite.collisionData.velocity.y = Math.min(
              sprite.collisionData.velocity.y,
              collision.target.velocity.y
            );
            sprite.collisionData.bounce = true;

            if (collision.target.velocity.x !== 0) {
              if (
                collision.target.velocity.x > 0 &&
                sprite.collisionData.velocity.x < collision.target.velocity.x
              ) {
                sprite.collisionData.velocity.x += 0.1;
              } else if (
                collision.target.velocity.x < 0 &&
                sprite.collisionData.velocity.x > collision.target.velocity.x
              ) {
                sprite.collisionData.velocity.x -= 0.1;
              }
            }
          }

          sprite.collisionData.yChange = Math.min(
            sprite.collisionData.yChange,
            -Math.round(collision.area.height)
          );

          if (sprite.velocity.y >= 4) {
            sprite.collisionData.velocity.y = Math.min(
              -sprite.velocity.y / 4,
              sprite.collisionData.velocity.y
            );
            sprite.collisionData.bounce = true;
            postMessage({
              type: "PLAY_SOUND",
              sound: "bump",
              x: sprite.x + sprite.width / 2,
              y: sprite.y + sprite.height / 2,
            });
            postMessage({
              type: "EMIT_PARTICLES",
              particleTypeId: "dust",
              amount: 10,
              particleProps: {
                x: sprite.x + sprite.width / 2,
                y: sprite.y + sprite.height,
                energy: sprite.velocity.y / 6,
                velocity: {
                  x: sprite.velocity.x / 2,
                  y: 0,
                },
              },
            });
          } else if (sprite.velocity.y > 0) {
            sprite.collisionData.velocity.y = Math.min(
              0,
              sprite.collisionData.velocity.y
            );
          }

          if (collision.targetShape === SHAPES.SLOPE_LEFT) {
            sprite.collisionData.velocity.x -=
              0.25 / (collision.target.width / collision.target.height);
          } else if (collision.targetShape === SHAPES.SLOPE_RIGHT) {
            sprite.collisionData.velocity.x +=
              0.25 / (collision.target.width / collision.target.height);
          }
        } else {
          sprite.collisionData.top = true;

          if (sprite.velocity.y <= -3) {
            sprite.collisionData.velocity.y = Math.max(
              -sprite.velocity.y / 4,
              sprite.collisionData.velocity.y
            );

            sprite.collisionData.bounce = true;

            if (sprite.weight > 0) {
              postMessage({
                type: "PLAY_SOUND",
                sound: "bump",
                x: sprite.x + sprite.width / 2,
                y: sprite.y + sprite.height / 2,
              });
              postMessage({
                type: "EMIT_PARTICLES",
                particleTypeId: "star",
                amount: 5,
                particleProps: {
                  x: sprite.x + sprite.width / 2,
                  y: sprite.y,
                  energy: sprite.velocity.y / 6,
                },
              });
            }
          } else if (sprite.velocity.y < 0 && !sprite.isElevator) {
            sprite.collisionData.velocity.y = Math.max(
              0,
              sprite.collisionData.velocity.y
            );
          }

          sprite.collisionData.yChange = Math.max(
            sprite.collisionData.yChange,
            Math.round(collision.area.height)
          );
        }
      } else {
        if (collision.collisionBox.l < collision.area.left) {
          sprite.collisionData.right = true;
          if (collision.target.isTile) {
            sprite.collisionData.wallHits++;
          }

          if (collision.target.isTile) {
            sprite.collisionData.xChange = Math.min(
              sprite.collisionData.xChange,
              -collision.area.width
            );
          } else if (
            Math.abs(sprite.velocity.x) >= Math.abs(collision.target.velocity.x)
          ) {
            sprite.collisionData.xChange = Math.min(
              sprite.collisionData.xChange,
              -collision.area.width
            );
          }

          if (sprite.velocity.x >= 1) {
            sprite.collisionData.velocity.x = Math.min(
              -sprite.velocity.x / 2,
              sprite.collisionData.velocity.x
            );

            if (sprite.weight > 0) {
              postMessage({
                type: "PLAY_SOUND",
                sound: "bump",
                x: sprite.x + sprite.width / 2,
                y: sprite.y + sprite.height / 2,
              });
            }
          } else if (sprite.velocity.x > 0) {
            sprite.collisionData.velocity.x = 0;
          }
        } else {
          sprite.collisionData.left = true;
          if (collision.target.isTile) {
            sprite.collisionData.wallHits++;
          }

          if (collision.target.isTile) {
            sprite.collisionData.xChange = Math.max(
              sprite.collisionData.xChange,
              collision.area.width
            );
          } else if (
            Math.abs(sprite.velocity.x) >= Math.abs(collision.target.velocity.x)
          ) {
            sprite.collisionData.xChange = Math.max(
              sprite.collisionData.xChange,
              collision.area.width
            );
          }

          if (sprite.velocity.x <= -1) {
            sprite.collisionData.velocity.x = Math.max(
              -sprite.velocity.x / 2,
              sprite.collisionData.velocity.x
            );

            if (sprite.weight > 0) {
              postMessage({
                type: "PLAY_SOUND",
                sound: "bump",
                x: sprite.x + sprite.width / 2,
                y: sprite.y + sprite.height / 2,
              });
            }
          } else if (sprite.velocity.x < 0) {
            sprite.collisionData.velocity.x = 0;
          }
        }

        if (collision.target.isSprite) {
          const colPercentage = Math.min(
            1,
            collision.target.height / sprite.height
          );
          sprite.collisionData.velocity.x +=
            (collision.target.velocity.x / 1.1) * colPercentage;
        }
      }

      collision.target.collision = true;
    }
    rounds--;
  } while (collision !== null && rounds > 0);

  // if (rounds === 0) {
  //    console.log('xxx')
  // }
}

function checkBoxToBoxCollision(box1, box2) {
  return (
    box1.r >= box2.l && box1.l <= box2.r && box1.b >= box2.t && box1.t <= box2.b
  );
}

// FIXME: Use collisionData.l,r,t,b instead of x + width and y + height
/*
function checkBoxMiddleToBoxCollision(box, slope) {
    return (box.x + box.width / 2 >= slope.x && box.x + box.width / 2 <= slope.x + slope.width &&
        box.y + box.height >= slope.y && box.y <= slope.y + slope.height);
}
*/
function checkBoxMiddleToBoxCollision(box, slope) {
  return (
    box.l + (box.r - box.l) / 2 >= slope.l &&
    box.l + (box.r - box.l) / 2 <= slope.r &&
    box.b >= slope.t &&
    box.t <= slope.b
  );
}
/*
function checkBoxToSlopeCollision(box, slope) {
    let slopeY = slope.y;
    if (slope.shape === SHAPES.SLOPE_LEFT) {
        slopeY = slope.y + ((slope.x + slope.width) - (box.x + box.width / 2)) / (slope.width / slope.height);
    }
    else if (slope.shape === SHAPES.SLOPE_RIGHT) {
        slopeY = slope.y + ((box.x + box.width / 2) - slope.x) / (slope.width / slope.height);
    }
    slopeY = Math.min(slopeY, slope.y + slope.height);
    slopeY = Math.max(slopeY, slope.y) - 1;
    return (box.x + box.width / 2 >= slope.x && box.x + box.width / 2 <= slope.x + slope.width &&
        box.y + box.height >= slopeY - 1 && box.y <= slope.y + slope.height);
}
*/
function checkBoxToSlopeCollision(box, slope) {
  let slopeY = slope.y;
  if (slope.shape === SHAPES.SLOPE_LEFT) {
    slopeY =
      slope.y +
      (slope.x + slope.width - (box.l + (box.r - box.l) / 2)) /
        (slope.width / slope.height);
  } else if (slope.shape === SHAPES.SLOPE_RIGHT) {
    slopeY =
      slope.y +
      (box.l + (box.r - box.l) / 2 - slope.x) / (slope.width / slope.height);
  }
  slopeY = Math.min(slopeY, slope.y + slope.height);
  slopeY = Math.max(slopeY, slope.y) - 1;
  return (
    box.l + (box.r - box.l) / 2 >= slope.x &&
    box.l + (box.r - box.l) / 2 <= slope.x + slope.width &&
    box.b >= slopeY - 1 &&
    box.t <= slope.y + slope.height
  );
}

/*
function checkBoxToCircleCollision(box, circle) {

    let testX = circle.x + circle.width / 2;
    let testY = circle.y + circle.height / 2;

    // which edge is closest?
    if (circle.x + circle.width / 2 < box.x) testX = box.x;      // test left edge
    else if (circle.x + circle.width / 2 > box.x + box.width) testX = box.x + box.width;   // right edge
    if (circle.y + circle.height / 2 < box.y) testY = box.y;      // top edge
    else if (circle.y + circle.height / 2 > box.y + box.height) testY = box.y + box.height;   // bottom edge

    // get distance from closest edges
    let distX = circle.x + circle.width / 2 - testX;
    let distY = circle.y + circle.height / 2 - testY;
    let distance = Math.sqrt((distX * distX) + (distY * distY));

    // if the distance is less than the radius, collision!
    if (distance <= circle.width / 2) {
        return true;
    }
    return false;
}
*/
function checkBoxToCircleCollision(box, circle) {
  const circleCenterX = circle.l + (circle.r - circle.l) / 2;
  const circleCenterY = circle.t + (circle.b - circle.t) / 2;
  let testX = circleCenterX;
  let testY = circleCenterY;

  // which edge is closest?
  if (circleCenterX < box.l) testX = box.l;
  // test left edge
  else if (circleCenterX > box.r) testX = box.r; // right edge
  if (circleCenterY < box.t) testY = box.t;
  // top edge
  else if (circleCenterY > box.b) testY = box.b; // bottom edge

  // get distance from closest edges
  const distX = circleCenterX - testX;
  const distY = circleCenterY - testY;
  const distance = Math.sqrt(distX * distX + distY * distY);

  // if the distance is less than the radius, collision!
  if (distance <= (circle.r - circle.l) / 2) {
    return true;
  }
  return false;
}

function calculatePenetrationArea(box1, box2) {
  const area = {};

  area.left = Math.max(box1.l, box2.l);
  area.right = Math.min(box1.r, box2.r);
  area.top = Math.max(box1.t, box2.t);
  area.bottom = Math.min(box1.b, box2.b);
  area.width = area.right - area.left;
  area.height = area.bottom - area.top;
  area.size = area.width * area.height;
  return area;
}

function calculatePenetrationAreaOld(box1, box2) {
  const area = {};
  area.left = Math.max(box2.x, box1.x);
  area.right = Math.min(box2.x + box2.width, box1.x + box1.width);
  area.top = Math.max(box2.y, box1.y);
  area.bottom = Math.min(box1.y + box1.height, box2.y + box2.height);
  area.width = area.right - area.left;
  area.height = area.bottom - area.top;
  area.size = area.width * area.height;
  return area;
}

/*
function calculateSlopePenetrationArea(box, slope) {
    let area = {};
    let slopeY = slope.y;
    if (slope.shape === SHAPES.SLOPE_LEFT) {
        slopeY = slope.y + ((slope.x + slope.width) - (box.x + box.width / 2)) / (slope.width / slope.height);
    }
    else if (slope.shape === SHAPES.SLOPE_RIGHT) {
        slopeY = slope.y + ((box.x + box.width / 2) - slope.x) / (slope.width / slope.height);
    }
    area.left = Math.max(slope.x, box.x);
    area.right = Math.min(slope.x + slope.width, box.x + box.width);
    area.top = Math.max(slopeY, box.y);
    area.bottom = Math.min(box.y + box.height, slope.y + slope.height);
    area.width = area.right - area.left;
    area.height = area.bottom - area.top;
    area.size = area.width * area.height;
    return area;
} */

function calculateSlopePenetrationArea(box, slope) {
  const area = {};
  let slopeY = slope.t;
  if (slope.shape === SHAPES.SLOPE_LEFT) {
    slopeY =
      slope.t +
      (slope.r - (box.l + (box.r - box.l) / 2)) / (slope.width / slope.height);
  } else if (slope.shape === SHAPES.SLOPE_RIGHT) {
    slopeY =
      slope.t +
      (box.l + (box.r - box.l) / 2 - slope.l) / (slope.width / slope.height);
  }
  area.left = Math.max(slope.l, box.l);
  area.right = Math.min(slope.r, box.r);
  area.top = Math.max(slopeY, box.t);
  area.bottom = Math.min(box.b, slope.b);
  area.width = area.right - area.left;
  area.height = area.bottom - area.top;
  area.size = area.width * area.height;
  return area;
}

function addSpriteTypes(types) {
  for (const i in types) {
    const patterns = JSON.parse(JSON.stringify(types[i].patterns));

    for (const pattern in patterns) {
      const behaviourList = [];
      patterns[pattern].behaviours.forEach((name) => {
        if (behaviours[name]) {
          behaviourList.push(behaviours[name]);
        } else {
          console.error(`Behaviour ${name} not found for type ${i}`);
        }
      });
      patterns[pattern].behaviours = behaviourList;
    }

    spriteTypes[i] = new SpriteType({
      ...types[i],
      patterns,
    });
  }
}

function addSprite(data) {
  const sprite = new Sprite(data);
  sprites.push(sprite);
  return sprite;
}

function setTiles(dataTiles) {
  if (dataTiles === undefined) {
    return;
  }
  if (dataTiles.length === 0) {
    tiles = [];
    return;
  }

  if (dataTiles.length === 1 || optimizeTiles === false) {
    // tiles = [new Tile(dataTiles[0])];
    tiles = dataTiles
      .filter((tile) => tile.blocks)
      .map((tile) => new Tile(tile));
    return;
  }

  tiles = [];
  // const length = dataTiles.length;

  while (tiles.length < dataTiles.length) {
    if (tiles.length > 0) {
      dataTiles = [...tiles];
      tiles = [];
    }

    dataTiles.forEach((tile) => {
      addTile(tile, tiles);
    });
  }

  // console.log(`${tiles.length} tiles added, ${length - tiles.length} merged / removed`);
}

function addTile(data, tiles) {
  if (data.blocks === false) {
    return;
  }

  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];

    if (data.shape === SHAPES.BOX && tile.shape === SHAPES.BOX) {
      // tile is inside another
      if (
        data.x >= tile.x &&
        data.x + data.width <= tile.x + tile.width &&
        data.y >= tile.y &&
        data.y + data.height <= tile.y + tile.height
      ) {
        // console.log(`tile ${data.id} removed: inside tile ${tile.id}`);
        return;
      }
      // tiles inside this tile
      if (
        data.x <= tile.x &&
        data.x + data.width >= tile.x + tile.width &&
        data.y <= tile.y &&
        data.y + data.height >= tile.y + tile.height
      ) {
        tile.x = data.x;
        tile.y = data.y;
        tile.width = data.width;
        tile.height = data.height;
        // console.log(`tile ${data.id} removed: size merged to tile ${tile.id}`);
        return;
      }
      // same left, same height
      if (
        data.x === tile.x + tile.width &&
        data.y === tile.y &&
        data.y + data.height === tile.y + tile.height
      ) {
        tile.width += data.width;
        // console.log(`tile ${data.id} removed: width merged to tile ${tile.id}`);
        return;
      }
      // same right, same height
      if (
        data.x + data.width === tile.x &&
        data.y === tile.y &&
        data.y + data.height === tile.y + tile.height
      ) {
        tile.x = data.x;
        tile.width += data.width;
        // console.log(`tile ${data.id} removed: width merged to tile ${tile.id}`);
        return;
      }
      // same bottom, same width
      if (
        data.y + data.height === tile.y &&
        data.x === tile.x &&
        data.x + data.width === tile.x + tile.width
      ) {
        tile.y = data.y;
        tile.height += data.height;
        // console.log(`tile ${data.id} removed: height merged to tile ${tile.id}`);
        return;
      }
      // same top, same width
      if (
        data.y === tile.y + tile.height &&
        data.x === tile.x &&
        data.x + data.width === tile.x + tile.width
      ) {
        tile.height += data.height;
        // console.log(`tile ${data.id} removed: height merged to tile ${tile.id}`);
        return;
      }
    }
  }

  tiles.push(new Tile(data));
}
