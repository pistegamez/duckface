/* eslint-disable no-undef */
"use strict";

// eslint-disable-next-line no-unused-vars
const behaviours = {
  idles: {
    init(sprite) {
      sprite.changeAnimation({ animation: "idle", randomFrame: true });
      sprite.idleChangeCounter = 60;
    },
    do({ sprite }) {
      if (
        sprite.idleChangeCounter === 0 &&
        sprite.collisionData.bottom &&
        sprite.velocity.x > -0.03 &&
        sprite.velocity.x < 0.03
      ) {
        sprite.changeAnimation({ animation: "idle", randomFrame: true });
        sprite.idleChangeCounter = 60;
      }
      if (sprite.idleChangeCounter > 0) {
        sprite.idleChangeCounter--;
      }
    },
  },

  unfails: {
    do({ sprite, nextState }) {
      if (sprite.energy > 0 && sprite.isPlayer) {
        nextState.failed = false;
      }
    },
  },

  fails: {
    do({ nextState }) {
      nextState.forceFail = true;
      if (!state.failed) {
        postMessage({ type: "PLAY_SOUND", sound: "fail" });
        sprites
          .filter((sprite) => sprite.isPlayer)
          .forEach((sprite) => {
            // sprite.energy = 0;
            sprite.isPlayer = false;
          });
      }
    },
  },

  jumps: {
    init(sprite) {
      if (sprite.maxJump === undefined) {
        sprite.maxJump = 25;
      }
      if (sprite.jumpPause === undefined) {
        sprite.jumpPause = 100;
      }
      sprite.jumpCounter = 0;
      sprite.jumpPauseCounter =
        Math.abs(sprite.x) % Math.max(1, sprite.jumpPause);
      sprite.groundContactCounter = 0;
      sprite.jumpAgain = true;
    },
    do({ sprite, state }) {
      if (
        (!sprite.isPlayer && !sprite.isEnemy) ||
        sprite.freezeCounter > 0 ||
        sprite.energy < 1 ||
        state.completed
      ) {
        return;
      }

      if (!controls.up || sprite.isEnemy) {
        sprite.jumpAgain = true;
      }

      if (
        sprite.collisionData.bottom &&
        (sprite.velocity.y >= 0 || sprite.collisionData.bounce)
      ) {
        if (sprite.jumpCounter > 0) {
          sprite.jumpPauseCounter = sprite.jumpPause;
        }

        sprite.jumpCounter = 0;
        sprite.groundContactCounter = 5;
      }

      if (sprite.isEnemy && sprite.jumpPauseCounter > 0) {
        sprite.jumpPauseCounter--;
      }

      if (sprite.collisionData.top && !sprite.collisionData.bottom) {
        sprite.jumpCounter = sprite.maxJump + 1;
      }

      const jump =
        (sprite.isPlayer && controls.up) ||
        (sprite.isEnemy && sprite.jumpPauseCounter === 0);

      if (
        (sprite.jumpAgain && sprite.groundContactCounter > 0) ||
        sprite.jumpCounter > 0
      ) {
        if (jump && sprite.jumpCounter <= sprite.maxJump) {
          if (sprite.jumpCounter === 0) {
            postMessage({
              type: "PLAY_SOUND",
              sound: "jump",
              x: sprite.x,
              y: sprite.y,
            });
            postMessage({
              type: "EMIT_PARTICLES",
              particleTypeId: "dust",
              amount: 8,
              particleProps: {
                x: sprite.x + sprite.width / 2,
                y: sprite.y + sprite.height,
                energy: 0.4,
                velocity: {
                  x: 0,
                  y: 0,
                },
              },
            });
          }

          if (sprite.jumpCounter > 0 && sprite.jumpCounter < 5) {
            postMessage({
              type: "EMIT_PARTICLES",
              particleTypeId: "dust",
              amount: 1,
              particleProps: {
                x: sprite.x + sprite.width / 2,
                y: sprite.y + sprite.height,
                energy: 0.1,
                velocity: {
                  x: 0,
                  y: 0,
                },
              },
            });
          }

          const easing = easeJump(
            Math.min(sprite.jumpCounter / sprite.maxJump, 1.0)
          );

          sprite.velocity.y = Math.min(
            sprite.velocity.y,
            -Math.max(sprite.weight, easing * 4)
          ); // 4
          sprite.jumpCounter++;
          sprite.jumpAgain = false;
        }
      }
      if (
        !jump &&
        sprite.jumpCounter > 0 &&
        sprite.jumpCounter < sprite.maxJump
      ) {
        sprite.jumpCounter = sprite.maxJump + 1;

        if (sprite.velocity.y < -1) {
          sprite.velocity.y /= 2;
        }
      }

      if (sprite.groundContactCounter > 0) {
        sprite.groundContactCounter--;
      }

      if (sprite.velocity.y < -3) {
        sprite.changeAnimation({ animation: "jump-up" });
      } else if (sprite.velocity.y > 3) {
        sprite.changeAnimation({ animation: "jump-down" });
      } else if (sprite.velocity.y > 0) {
        sprite.changeAnimation({ animation: "jump-middle" });
      }
    },
  },

  moves: {
    init(sprite) {
      sprite.groundContactCounter = 0;
      sprite.direction = DIRECTION.RIGHT;
      sprite.acceleration = sprite.acceleration || 0.25;
    },
    do({ sprite }) {
      if (!sprite.isPlayer) {
        if (sprite.velocity.x > 0) {
          sprite.direction = DIRECTION.RIGHT;
        } else if (sprite.velocity.x < 0) {
          sprite.direction = DIRECTION.LEFT;
        }
      }

      if (
        !sprite.isPlayer ||
        sprite.freezeCounter > 0 ||
        sprite.energy < 1 ||
        state.completed
      ) {
        return;
      }

      if (controls.right) {
        sprite.direction = DIRECTION.RIGHT;
        if (sprite.collisionData.bottom) {
          sprite.velocity.x += sprite.acceleration;
          if (
            (sprite.velocity.x > 2 && Math.random() < 0.1) ||
            sprite.velocity.x < 0
          ) {
            postMessage({
              type: "EMIT_PARTICLES",
              particleTypeId: "dust",
              amount: 2,
              particleProps: {
                x: sprite.x + sprite.width / 2,
                y: sprite.y + sprite.height,
                energy: 0.1,
                velocity: {
                  x: sprite.velocity.x / 2,
                  y: 0,
                },
              },
            });
          }
        } else {
          sprite.velocity.x += sprite.acceleration / 2;
        }
      }
      if (controls.left) {
        sprite.direction = DIRECTION.LEFT;
        if (sprite.collisionData.bottom) {
          sprite.velocity.x -= sprite.acceleration;
          if (
            (sprite.velocity.x < -2 && Math.random() < 0.1) ||
            sprite.velocity.x > 0
          ) {
            postMessage({
              type: "EMIT_PARTICLES",
              particleTypeId: "dust",
              amount: 2,
              particleProps: {
                x: sprite.x + sprite.width / 2,
                y: sprite.y + sprite.height,
                energy: 0.1,
                velocity: {
                  x: sprite.velocity.x / 2,
                  y: 0,
                },
              },
            });
          }
        } else {
          sprite.velocity.x -= sprite.acceleration / 2;
        }
      }

      if (sprite.collisionData.bottom && sprite.velocity.x !== 0) {
        sprite.changeAnimation({ animation: "move" });
      }
    },
  },

  grows: {
    init(sprite) {
      sprite.transform = sprite.transform || { counter: 0 };
      sprite.transform.width = sprite.width;
      sprite.transform.height = sprite.height;
    },
    do({ sprite }) {
      if (sprite.transform && sprite.transform.counter > 0) {
        sprite.transform.counter -= 0.05;
        const easing = easeTransform(1.0 - sprite.transform.counter); // easeOutElastic(1.0 - sprite.transform.counter);

        // TODO grow sideways if squeezed

        sprite.width = Math.floor(
          sprite.transform.originalWidth +
            (sprite.transform.width - sprite.transform.originalWidth) * easing
        );
        sprite.x = Math.floor(
          sprite.transform.originalX -
            ((sprite.transform.width - sprite.transform.originalWidth) *
              easing) /
              2
        );

        sprite.height = Math.floor(
          sprite.transform.originalHeight +
            (sprite.transform.height - sprite.transform.originalHeight) * easing
        );
        sprite.y = Math.floor(
          sprite.transform.originalY -
            ((sprite.transform.height - sprite.transform.originalHeight) *
              easing) /
              2
        );
      }
    },
  },

  "changes-collectors-size": {
    init(sprite) {
      sprite.transform = sprite.transform || {};
      sprite.transform.width = sprite.transform.width || sprite.width;
      sprite.transform.height = sprite.transform.height || sprite.height;
    },
    do({ sprite, sprites }) {
      // if (sprite.energy > 0) {
      sprite.collisionData.spriteIds.forEach((id) => {
        const target = sprites.find((sprite) => sprite.id === id);
        if (
          target &&
          !target.isEnemy &&
          target.isCollector &&
          target.transform &&
          target.energy > 0
        ) {
          target.transform.originalWidth = target.width;
          target.transform.originalHeight = target.height;
          target.transform.originalX = target.x;
          target.transform.originalY = target.y;
          target.transform.counter = 1.0;
          target.transform.width += sprite.transform.width;
          target.transform.height += sprite.transform.height;

          if (sprite.transform.width > 0 || sprite.transform.height > 0) {
            postMessage({
              type: "PLAY_SOUND",
              sound: "transform-up",
              x: target.x,
              y: target.y,
            });
          } else {
            postMessage({
              type: "PLAY_SOUND",
              sound: "transform-down",
              x: target.x,
              y: target.y,
            });
          }
          target.freezeCounter = 30;
        }
      });
      // }
    },
  },

  "throttle-players-max-speed": {
    do({ sprite, sprites }) {
      sprite.collisionData.spriteIds.forEach((id) => {
        const target = sprites.find((sprite) => sprite.id === id);
        if (target && target.isPlayer && target.energy > 0) {
          target.maxVelocity.x += sprite.transform.maxVelocityX;
          postMessage({
            type: "PLAY_SOUND",
            sound: "transform-up",
            x: target.x,
            y: target.y,
          });
          target.freezeCounter = 30;
        }
      });
    },
  },

  "throttle-players-max-jump": {
    init(sprite) {
      sprite.transform = sprite.transform || {};
      sprite.transform.maxJump = sprite.transform.maxJump || 2;
    },
    do({ sprite, sprites }) {
      sprite.collisionData.spriteIds.forEach((id) => {
        const target = sprites.find((sprite) => sprite.id === id);
        if (target && target.isPlayer && target.energy > 0 && target.maxJump) {
          target.maxJump += sprite.transform.maxJump;
          postMessage({
            type: "PLAY_SOUND",
            sound: "transform-up",
            x: target.x,
            y: target.y,
          });
          target.freezeCounter = 30;
          target.damageCounter = 30;
        }
      });
    },
  },

  "changes-collectors-weight": {
    init(sprite) {
      sprite.transform = sprite.transform || {};
      sprite.transform.weight = sprite.transform.weight || 0.5;
    },
    do({ sprite, sprites }) {
      sprite.collisionData.spriteIds.forEach((id) => {
        const target = sprites.find((sprite) => sprite.id === id);
        if (
          target &&
          !target.isEnemy &&
          target.isCollector &&
          target.pattern === "default"
        ) {
          // target.pattern = sprite.transform.pattern;
          target.weight += sprite.transform.weight;
          postMessage({
            type: "PLAY_SOUND",
            sound: "transform-up",
            x: target.x,
            y: target.y,
          });
          target.freezeCounter = 30;
        }
      });
    },
  },

  "changes-collectors-pattern": {
    do({ sprite, sprites }) {
      sprite.collisionData.spriteIds.forEach((id) => {
        const target = sprites.find((sprite) => sprite.id === id);
        if (
          target &&
          !target.isEnemy &&
          target.isCollector &&
          target.pattern === "default"
        ) {
          // target.pattern = sprite.transform.pattern;
          target.changePattern(sprite.transform.pattern);
          postMessage({
            type: "PLAY_SOUND",
            sound: "transform-up",
            x: target.x,
            y: target.y,
          });
          target.freezeCounter = 30;
        }
      });
    },
  },

  "changes-players-props": {
    do({ sprite, sprites }) {
      sprite.collisionData.spriteIds.forEach((id) => {
        const target = sprites.find((sprite) => sprite.id === id);
        if (target && target.isPlayer && target.energy > 0) {
          for (const prop in sprite.transform) {
            target[prop] = sprite.transform.spriteProps[prop];
          }
          if (sprite.transform.sound) {
            postMessage({
              type: "PLAY_SOUND",
              sound: sprite.transform.sound,
              x: target.x,
              y: target.y,
            });
          }
          target.freezeCounter = 30;
        }
      });
    },
  },

  "shoots-fireball": {
    init(sprite) {
      sprite.reloadCounter = sprite.reloadCounter || 0;
      sprite.reloadWait = sprite.reloadWait || 100;
      sprite.fireBallSize = sprite.fireBallSize || 40;
      sprite.shootY = sprite.shootY || 0.5;
    },

    do({ sprite }) {
      if (sprite.energy <= 0) {
        return;
      }

      if (sprite.reloadCounter > 0) {
        sprite.reloadCounter--;
      } else {
        addSprite({
          typeId: "fireball",
          x:
            sprite.direction === DIRECTION.LEFT
              ? sprite.x
              : sprite.x + sprite.width - sprite.fireBallSize / 2,
          y: sprite.y + sprite.height * sprite.shootY - sprite.fireBallSize / 2,
          weight: 0,
          width: sprite.fireBallSize,
          height: sprite.fireBallSize,
          energy: 75,
          isEnemy: sprite.isEnemy,
          direction: sprite.direction,
          velocity: {
            y: 0,
            x: sprite.direction === DIRECTION.LEFT ? -6 : 6,
          },
          maxVelocity: { y: 6, x: 6 },
        });
        sprite.reloadCounter = sprite.reloadWait;
        postMessage({
          type: "PLAY_SOUND",
          sound: "fire",
          x: sprite.x,
          y: sprite.y,
        });
        sprite.changeAnimation({ animation: "attack", forceChange: true });
      }
      if (sprite.reloadCounter > sprite.reloadWait / 2) {
        sprite.changeAnimation({ animation: "attack" });
      }
    },
  },

  fireball: {
    do({ sprite, sprites }) {
      if (sprite.energy > 0) {
        sprite.energy--;

        sprite.collisionData.spriteIds.forEach((id) => {
          const target = sprites.find((sprite) => sprite.id === id);
          if (target && target.isEnemy !== sprite.isEnemy) {
            sprite.energy = 0;
            target.energy--;
            target.damageCounter = 30;
            postMessage({
              type: "PLAY_SOUND",
              sound: "damage",
              x: target.x,
              y: target.y,
            });
          }
        });

        if (sprite.energy % 2 === 0) {
          postMessage({
            type: "EMIT_PARTICLES",
            particleTypeId: "fire",
            amount: 3,
            particleProps: {
              x: sprite.x + sprite.width / 2,
              y: sprite.y + sprite.height / 2,
              velocity: {
                x: sprite.velocity.x / 4,
                y: sprite.velocity.y / 4,
              },
            },
          });
        }
      } else {
        sprite.remove = true;
      }
    },
  },

  "changes-players-type": {
    do({ sprite, sprites }) {
      sprite.collisionData.spriteIds.forEach((id) => {
        const target = sprites.find((sprite) => sprite.id === id);
        if (target && target.isPlayer && target.energy > 0) {
          target.setType(sprite.typeId);
          target.damageCounter = 30;
          postMessage({
            type: "PLAY_SOUND",
            sound: "transform-up",
            x: target.x,
            y: target.y,
          });
          target.isPlayer = false;
        }
      });
    },
  },

  "is-happy-when-completed": {
    do({ sprite, state }) {
      if (state.completed === true) {
        sprite.changePattern("happy");
      }
    },
  },

  "moves-forward": {
    init(sprite) {
      sprite.acceleration = sprite.acceleration || 0.2;
    },
    do({ sprite, state }) {
      if (state.completed) {
        return;
      }

      if (sprite.collisionData.bottom || sprite.weight === 0) {
        if (sprite.direction === DIRECTION.RIGHT) {
          sprite.velocity.x += sprite.acceleration;
        } else if (sprite.direction === DIRECTION.LEFT) {
          sprite.velocity.x -= sprite.acceleration;
        }
      }

      if (
        (sprite.collisionData.bottom || sprite.weight === 0) &&
        sprite.velocity.x !== 0
      ) {
        sprite.changeAnimation({ animation: "move", randomFrame: true });
      } else if (sprite.velocity.y < -3) {
        sprite.changeAnimation({ animation: "jump-up" });
      } else if (sprite.velocity.y > 3) {
        sprite.changeAnimation({ animation: "jump-down" });
      } else if (sprite.velocity.y > 0) {
        sprite.changeAnimation({ animation: "jump-middle" });
      }
    },
  },

  "moves-upward": {
    init(sprite) {
      sprite.direction = DIRECTION.UP;
      sprite.acceleration = sprite.acceleration || 0.2;
    },
    do({ sprite, state, sprites }) {
      if (state.completed) {
        return;
      }

      const jammedSprites = Array.from(sprite.collisionData.spriteIds)
        .map((id) => sprites.find((s) => s.id === id))
        .filter(
          (sprite) => sprite.collisionData.bottom && sprite.collisionData.top
        );

      if (jammedSprites.length > 0) {
        sprite.velocity.y = 0;
        return;
      }

      if (sprite.direction === DIRECTION.DOWN) {
        sprite.velocity.y += sprite.acceleration;
      } else if (sprite.direction === DIRECTION.UP) {
        sprite.velocity.y -= sprite.acceleration;
      }
    },
  },

  "changes-direction-randomly": {
    init(sprite) {
      sprite.direction = sprite.acceleration || 0.1;
      sprite.directionCounter = 200 + Math.floor(Math.random() * 200);
    },
    do({ sprite }) {
      if (sprite.isPlayer) {
        return;
      }
      sprite.directionCounter--;
      if (sprite.directionCounter < 0) {
        if (sprite.direction === DIRECTION.LEFT) {
          sprite.direction = DIRECTION.RIGHT;
        } else {
          sprite.direction = DIRECTION.LEFT;
        }
        sprite.directionCounter = 100 + Math.floor(Math.random() * 200);
      }
    },
  },

  "moves-stops": {
    init(sprite) {
      sprite.acceleration = sprite.acceleration || 0.1;
      sprite.walkCounter = 0; // Math.floor(Math.random() * 1500);
      sprite.stopCounter = 0; // Math.floor(Math.random() * 200);
    },
    do({ sprite, state }) {
      if (state.completed) {
        return;
      }

      sprite.collisionData.spriteIds.forEach((id) => {
        const target = sprites.find((sprite) => sprite.id === id);
        if (target && target.isPlayer && target.energy > 0) {
          sprite.direction = target.direction;
        }
        /*
                else {
                    target.direction = sprite.direction;
                } */
      });

      if (sprite.walkCounter > 0) {
        if (sprite.collisionData.bottom || sprite.weight === 0) {
          if (sprite.direction === DIRECTION.RIGHT) {
            sprite.velocity.x += sprite.acceleration;
          } else if (sprite.direction === DIRECTION.LEFT) {
            sprite.velocity.x -= sprite.acceleration;
          }
        }

        sprite.walkCounter--;
      } else {
        sprite.walkCounter = 1500; // Math.floor(500 + Math.random() * 1500);
        // sprite.stopCounter = Math.floor(Math.random() * 200);
      }

      if (
        (sprite.collisionData.bottom || sprite.weight === 0) &&
        sprite.velocity.x !== 0
      ) {
        sprite.changeAnimation({ animation: "move" });
      } else if (sprite.velocity.y < -3) {
        sprite.changeAnimation({ animation: "jump-up" });
      } else if (sprite.velocity.y > 3) {
        sprite.changeAnimation({ animation: "jump-down" });
      } else if (sprite.velocity.y > 0) {
        sprite.changeAnimation({ animation: "jump-middle" });
      }
    },
  },

  "is-x-locked": {
    init(sprite) {
      sprite.originalX = sprite.x;
    },
    do({ sprite }) {
      sprite.x = sprite.originalX;
      sprite.velocity.x = 0;
    },
  },

  "is-y-locked": {
    init(sprite) {
      sprite.originalY = sprite.y;
    },
    do({ sprite }) {
      sprite.y = sprite.originalY;
      sprite.velocity.y = 0;
    },
  },

  floats: {
    init(sprite) {
      sprite.floatCounter = sprite.x % 360;
      if (!sprite.floatFactor) {
        sprite.floatFactor = 10;
      }
      if (!sprite.floatStep) {
        sprite.floatStep = 10;
      }

      if (sprite.originalFloatY === undefined) {
        sprite.originalFloatY = sprite.y;
        sprite.y =
          sprite.originalFloatY +
          Math.sin(sprite.floatCounter / sprite.floatStep) * sprite.floatFactor;
      }
    },
    do({ sprite }) {
      if (sprite.energy <= 0) {
        return;
      }

      sprite.y =
        sprite.originalFloatY +
        Math.sin(sprite.floatCounter / sprite.floatStep) * sprite.floatFactor;
      sprite.floatCounter++;
    },
  },

  "falls-if-dead": {
    do({ sprite }) {
      if (sprite.energy <= 0) {
        sprite.weight = 2.5;
      }
    },
  },

  "changes-type-when-completed": {
    do({ sprite, state }) {
      if (sprite.energy > 0 && state.completed) {
        sprite.setType(sprite.transform.typeId);
        sprite.color = sprite.transform.color;
        sprite.damageCounter = 30;
        postMessage({
          type: "PLAY_SOUND",
          sound: "transform-up",
          x: sprite.x,
          y: sprite.y,
        });
      }
    },
  },

  falls: {
    do({ sprite }) {
      if (sprite.collisionData.bottom && sprite.velocity.x === 0) {
        sprite.changeAnimation({ animation: "idle", randomFrame: true });
      } else if (sprite.velocity.y < -3) {
        sprite.changeAnimation({ animation: "jump-up" });
      } else if (sprite.velocity.y > 3) {
        sprite.changeAnimation({ animation: "jump-down" });
      } else if (sprite.velocity.y > 0) {
        sprite.changeAnimation({ animation: "jump-middle" });
      }
    },
  },

  "moves-forward-if-touched": {
    init(sprite) {
      sprite.acceleration = sprite.acceleration || 0.25;
    },
    do({ sprite }) {
      if (
        sprite.collisionData.bottom &&
        (sprite.collisionData.playerHits > 0 ||
          sprite.collisionData.enemyHits > 0)
      ) {
        if (sprite.velocity.x === 0) {
          postMessage({
            type: "PLAY_SOUND",
            sound: "alert",
            x: sprite.x,
            y: sprite.y,
          });
        }

        if (sprite.direction === DIRECTION.RIGHT) {
          sprite.velocity.x += sprite.acceleration;
        } else if (sprite.direction === DIRECTION.LEFT) {
          sprite.velocity.x -= sprite.acceleration;
        }
      }

      if (sprite.collisionData.bottom && sprite.velocity.x !== 0) {
        sprite.changeAnimation({ animation: "move" });
      } else if (sprite.velocity.y < -3) {
        sprite.changeAnimation({ animation: "jump-up" });
      } else if (sprite.velocity.y > 3) {
        sprite.changeAnimation({ animation: "jump-down" });
      } else if (sprite.velocity.y > 0) {
        sprite.changeAnimation({ animation: "jump-middle" });
      }
    },
  },

  "changes-direction-on-collision": {
    do({ sprite }) {
      if (sprite.collisionData.bottom || sprite.weight === 0) {
        if (sprite.collisionData.left && sprite.direction !== DIRECTION.RIGHT) {
          sprite.direction = DIRECTION.RIGHT;
        }
        if (sprite.collisionData.right && sprite.direction !== DIRECTION.LEFT) {
          sprite.direction = DIRECTION.LEFT;
        }
      }
    },
  },

  "changes-vertical-direction-on-tile-collision": {
    do({ sprite }) {
      if (
        sprite.collisionData.spriteIds.size > 0 &&
        sprite.collisionData.tileIds.size === 0
      ) {
        return;
      }
      if (sprite.collisionData.top && sprite.direction !== DIRECTION.DOWN) {
        sprite.direction = DIRECTION.DOWN;
      }
      if (sprite.collisionData.bottom && sprite.direction !== DIRECTION.UP) {
        sprite.direction = DIRECTION.UP;
      }
    },
  },

  "blocks-completion": {
    do({ sprite, nextState }) {
      if (sprite.energy > 0) {
        nextState.completed = false;
      }
    },
  },

  "stops-when-completed": {
    do({ sprite, state }) {
      if (state.completed) {
        sprite.velocity.x = 0;
        sprite.velocity.y = 0;
      }
    },
  },

  "is-lock": {
    do({ sprite, sprites }) {
      if (!sprites.some((sprite) => sprite.isKey === true)) {
        sprite.energy = 0;
      }
    },
  },

  exit: {
    init(sprite) {
      sprite.playerTouched = false;
    },
    do({ sprite, state, nextState }) {
      if (!sprite.playerTouched && sprite.collisionData.playerHits === 0) {
        nextState.completed = false;
      } else if (state.completed === true) {
        sprite.playerTouched = true;
      }
    },
  },

  "changes-pattern-when-energy-low": {
    init(sprite) {
      sprite.transform = sprite.transform || {};
      sprite.energyLowPatternChanged = false;
      sprite.transform.energyThreshold = sprite.transform.energyThreshold || 1;
    },
    do({ sprite }) {
      if (
        sprite.energy <= sprite.transform.energyThreshold &&
        !sprite.energyLowPatternChanged &&
        sprite.pattern !== sprite.transform.pattern
      ) {
        sprite.changePattern(sprite.transform.pattern);
        sprite.transform.patternChanged = true;
      }
    },
  },

  "removed-if-energy-0": {
    init(sprite) {
      // sprite.exitSound =
    },
    do({ sprite }) {
      if (sprite.energy <= 0 && !sprite.remove) {
        sprite.remove = true;
        postMessage({
          type: "PLAY_SOUND",
          sound: "collect",
          x: sprite.x,
          y: sprite.y,
        });
        postMessage({
          type: "EMIT_PARTICLES",
          particleTypeId: "crumb",
          amount: 10,
          particleProps: {
            x: sprite.x + sprite.width / 2,
            y: sprite.y + sprite.height / 2,
          },
        });
      }
    },
  },

  "is-accessory": {
    init(sprite) {
      sprite.accessory = sprite.accessory || {
        x: Math.random(),
        y: Math.random(),
      };
    },
    do({ sprite, sprites }) {
      if (!sprite.accessory.targetId) {
        sprite.collisionData.spriteIds.forEach((id) => {
          const target = sprites.find((sprite) => sprite.id === id);
          if (target && target.isPlayer && target.energy > 0) {
            sprite.accessory.targetId = target.id;
            postMessage({
              type: "PLAY_SOUND",
              sound: "pop",
              x: sprite.x,
              y: sprite.y,
            });
            sprite.energy = 0;
          }
        });
      } else {
        const target = sprites.find((s) => s.id === sprite.accessory.targetId);
        if (target) {
          sprite.x =
            target.x + target.width * sprite.accessory.x - sprite.width / 2;
          sprite.y =
            target.y + target.height * sprite.accessory.y - sprite.height / 2;
        }
      }
    },
  },

  "kills-falling": {
    do({ sprite, sprites }) {
      sprite.collisionData.spriteIds.forEach((id) => {
        const target = sprites.find((sprite) => sprite.id === id);

        if (
          target &&
          target.isPlayer &&
          target.velocity.y > 0.1 &&
          target.y < sprite.y &&
          target.energy > 0
        ) {
          // target.remove = true;
          target.damageCounter = 30;
          target.energy = 0;
          postMessage({
            type: "EMIT_PARTICLES",
            particleTypeId: "star",
            amount: 9,
            particleProps: {
              x: target.x + target.width / 2,
              y: target.y + target.height / 2,
              energy: 20,
            },
          });
        }
      });
    },
  },

  "kills-rising": {
    do({ sprite, sprites }) {
      sprite.collisionData.spriteIds.forEach((id) => {
        const target = sprites.find((sprite) => sprite.id === id);

        if (
          target &&
          target.isPlayer &&
          target.velocity.y < 0.1 &&
          target.y > sprite.y &&
          target.energy > 0
        ) {
          // target.remove = true;
          target.damageCounter = 30;
          target.energy = 0;
          postMessage({
            type: "EMIT_PARTICLES",
            particleTypeId: "star",
            amount: 9,
            particleProps: {
              x: target.x + target.width / 2,
              y: target.y + target.height / 2,
              energy: 20,
            },
          });
        }
      });
    },
  },

  sweats: {
    do({ sprite }) {
      if (sprite.energy > 0 && Math.random() > 0.95) {
        postMessage({
          type: "EMIT_PARTICLES",
          particleTypeId: "drop",
          amount: 1,
          particleProps: {
            x: sprite.x + Math.random() * sprite.width,
            y: sprite.y + 8,
          },
        });
      }
    },
  },

  "kills-player": {
    do({ sprite, sprites }) {
      sprite.collisionData.spriteIds.forEach((id) => {
        const target = sprites.find((sprite) => sprite.id === id);
        if (target && target.isPlayer && target.energy > 0) {
          target.energy = 0;
          target.damageCounter = 30;
          postMessage({
            type: "PLAY_SOUND",
            sound: "alert",
            x: sprite.x,
            y: sprite.y,
          });
          postMessage({
            type: "EMIT_PARTICLES",
            particleTypeId: "star",
            amount: 9,
            particleProps: {
              x: target.x + target.width / 2,
              y: target.y + target.height / 2,
              energy: 20,
            },
          });
        }
      });
    },
  },

  collects: {
    init(sprite) {
      sprite.isCollector = true;
      sprite.collectCounter = 0;
    },
    do({ sprite, sprites }) {
      if (sprite.energy <= 0) {
        return;
      }

      sprite.collisionData.spriteIds.forEach((id) => {
        const target = sprites.find((sprite) => sprite.id === id);
        if (
          target &&
          target.energy > 0 &&
          spriteTypes[target.typeId].collectable
        ) {
          target.energy = 0;
          sprite.collectCounter = 10;
        }
      });

      if (sprite.collectCounter > 0) {
        sprite.changeAnimation({ animation: "collect" });
        sprite.collectCounter--;
      }
    },
  },

  "looks-at-player": {
    do({ sprite, sprites }) {
      if (sprite.isPlayer) {
        return;
      }
      const players = sprites.filter((sprite) => sprite.isPlayer);
      let distance = 200;

      players.forEach((player) => {
        if (Math.abs(player.x - sprite.x) < distance) {
          distance = Math.abs(player.x - sprite.x);

          if (player.x < sprite.x) {
            sprite.direction = DIRECTION.LEFT;
          } else {
            sprite.direction = DIRECTION.RIGHT;
          }
        }
      });
    },
  },

  "looks-around": {
    init(sprite) {
      if (sprite.lookAroundInterval === undefined) {
        sprite.lookAroundInterval = 250;
      }
      sprite.lookAroundCounter = sprite.lookAroundInterval;
      sprite.changeAnimation({ animation: "idle" });
    },
    do({ sprite }) {
      if (sprite.velocity.x === 0) {
        sprite.lookAroundCounter--;

        if (sprite.lookAroundCounter < 1) {
          if (sprite.direction === DIRECTION.LEFT) {
            sprite.direction = DIRECTION.RIGHT;
          } else if (sprite.direction === DIRECTION.RIGHT) {
            sprite.direction = DIRECTION.LEFT;
          }
          sprite.lookAroundCounter = sprite.lookAroundInterval;
        }
      } else {
        sprite.lookAroundCounter = sprite.lookAroundInterval;
      }
    },
  },

  "follows-player": {
    do({ sprite, sprites }) {
      if (state.completed || sprite.isPlayer) {
        return;
      }

      const players = sprites.filter(
        (sprite) => sprite.isPlayer && sprite.energy > 0
      );

      players.forEach((player) => {
        if (
          Math.abs(player.x + player.width / 2 - sprite.x + sprite.width / 2) <=
            500 &&
          player.y + player.height > sprite.y &&
          player.y < sprite.y + sprite.height
        ) {
          if (player.x < sprite.x && sprite.direction === DIRECTION.LEFT) {
            sprite.velocity.x -= 0.1;
            sprite.changeAnimation({ animation: "move" });
          } else if (
            player.x > sprite.x &&
            sprite.direction === DIRECTION.RIGHT
          ) {
            sprite.velocity.x += 0.1;
            sprite.changeAnimation({ animation: "move" });
          }
        }
      });
    },
  },

  blows: {
    init(sprite) {
      sprite.blowReloadCounter = sprite.blowReloadCounter || 0;
      sprite.blowDuration = sprite.blowDuration || 100;
      sprite.blowWait = sprite.blowWait !== undefined ? sprite.blowWait : 100;
      sprite.blowCounter = 0;
      sprite.blowEnergy = sprite.blowEnergy || 100;
      sprite.blowReloadWait = sprite.blowReloadWait || 10;
      sprite.blowSize = sprite.blowSize !== undefined ? sprite.blowSize : 35;
      sprite.blowX = sprite.blowX !== undefined ? sprite.blowX : 1;
      sprite.blowY = sprite.blowY !== undefined ? sprite.blowY : 0.5;
      sprite.blowVelocityX = sprite.blowVelocityX !== undefined ? sprite.blowVelocityX : 0;
      sprite.blowVelocityY = sprite.blowVelocityY !== undefined ? sprite.blowVelocityY : 0;
    },

    do({ sprite }) {
      if (sprite.energy <= 0) {
        return;
      }

      sprite.blowCounter++;

      if (sprite.blowCounter >= sprite.blowWait) {
        sprite.changeAnimation({ animation: "blow", forceChange: true });
        if (sprite.blowReloadCounter > 0) {
          sprite.blowReloadCounter--;
        } else {
          const height = Math.min(sprite.blowSize, sprite.height / 2);
          addSprite({
            typeId: "wind",
            parentId: sprite.id,
            x:
              sprite.direction === DIRECTION.LEFT
                ? sprite.x + sprite.width - sprite.width * sprite.blowX - sprite.blowSize / 2
                : sprite.x + sprite.width * sprite.blowX - sprite.blowSize / 2,
            y: sprite.y + sprite.height * sprite.blowY - sprite.blowSize / 2,
            width: sprite.blowSize,
            height,
            energy: sprite.blowEnergy,
            direction: sprite.direction,
            velocity: {
              y: sprite.blowVelocityY,
              x: sprite.direction === DIRECTION.LEFT ? -sprite.blowVelocityX : sprite.blowVelocityX,
            },
            maxVelocity: { y: 10, x: 10 },
          });

          sprite.blowReloadCounter = sprite.blowReloadWait;

          if (sprite.blowCounter === sprite.blowWait) {
            postMessage({
              type: "PLAY_SOUND",
              sound: "fire",
              x: sprite.x,
              y: sprite.y,
            });
          }
        }
        /*
        if (sprite.blowReloadCounter > sprite.blowReloadWait / 2) {
          sprite.changeAnimation({ animation: "blow" });
        } */
      }

      if (sprite.blowCounter >= sprite.blowWait + sprite.blowDuration) {
        sprite.blowCounter = 0;
        sprite.blowReloadCounter = 0;
        sprite.changeAnimation({ animation: "idle", randomFrame: true });
      }
    },
  },

  wind: {
    init(sprite) {
      sprite.changeAnimation({ animation: "blow" });
    },
    do({ sprite, sprites }) {
      if (sprite.energy > 0 && sprite.collisionData.wallHits === 0) {
        sprite.energy--;

        if (sprite.energy < 20) {
          sprite.changeAnimation({ animation: "fade" });
        }

        sprite.velocity.x *= 0.999;

        sprite.collisionData.spriteIds.forEach((id) => {
          if (id === sprite.parentId) {
            return;
          }

          const target = sprites.find((sprite) => sprite.id === id);
          if (target) {
            if (
              sprite.velocity.x > 0 &&
              target.velocity.x < sprite.velocity.x
            ) {
              target.velocity.x = Math.min(
                target.velocity.x + 0.22,
                sprite.velocity.x
              );
            } else if (
              sprite.velocity.x < 0 &&
              target.velocity.x > sprite.velocity.x
            ) {
              target.velocity.x = Math.max(
                target.velocity.x - 0.22,
                sprite.velocity.x
              );
            }

            if (
              sprite.velocity.y > 0 &&
              target.velocity.y < sprite.velocity.y
            ) {
              target.velocity.y = Math.min(
                target.velocity.y + 0.251,
                sprite.velocity.y
              );
            } else if (
              sprite.velocity.y < 0 &&
              target.velocity.y > sprite.velocity.y
            ) {
              target.velocity.y = Math.max(
                target.velocity.y - 0.251,
                sprite.velocity.y
              );
            }
            // sprite.energy = 0;
            // target.energy--;
            // target.damageCounter = 30;
            /* 
            postMessage({
              type: "PLAY_SOUND",
              sound: "damage",
              x: target.x,
              y: target.y,
            }); */
          }
        });
      } else {
        sprite.remove = true;
      }
    },
  },
  /*
  blows: {
    init(sprite) {
      sprite.blowCounter = sprite.x % 200;
      sprite.blowTop = sprite.blowTop || 0;
      sprite.blowBottom = sprite.blowBottom || 1;
      sprite.blowLeft = sprite.blowLeft || 0;
      sprite.blowRight = sprite.blowRight || 1;
      sprite.blowStart = sprite.blowStart || 100;
      sprite.blowEnd = sprite.blowEnd || 200;
    },
    do({ sprite, sprites }) {
      if (sprite.energy <= 0) {
        return;
      }

      sprite.blowCounter++;

      if (sprite.blowCounter >= sprite.blowStart) {
        sprite.changeAnimation({ animation: "blow" });
        if (sprite.blowCounter === sprite.blowStart) {
          postMessage({
            type: "PLAY_SOUND",
            sound: "fire",
            x: sprite.x,
            y: sprite.y,
          });
        }

        const players = sprites.filter(
          (sprite) =>
            !sprite.isEnemy && spriteTypes[sprite.typeId].movedByOtherSprites
        );

        players.forEach((player) => {
          if (sprite.blowDirection && sprite.blowDirection === DIRECTION.UP) {
            const distance = Math.abs(
              player.y + player.height / 2 - sprite.y + sprite.height / 2
            );
            if (
              distance <=
              Math.min(500, (sprite.blowCounter - sprite.blowStart) * 5)
            ) {
              const power =
                50 *
                (1 -
                  (sprite.blowCounter - sprite.blowStart) /
                    (sprite.blowEnd - sprite.blowStart));
              if (
                sprite.direction === DIRECTION.RIGHT &&
                player.x + player.width >
                  sprite.x + sprite.width * sprite.blowLeft &&
                player.x < sprite.x + sprite.width * sprite.blowRight
              ) {
                player.velocity.y -= Math.max(
                  0.1,
                  Math.min(5, power / distance)
                );
                // player.velocity.y -= Math.max(0.2, 1 / Math.min(50,distance));
                if (player.maxJump) {
                  player.jumpCounter = player.maxJump - 1;
                  // player.jumpAgain = true;
                }
              } else if (
                sprite.direction === DIRECTION.LEFT &&
                player.x + player.width > sprite.x &&
                player.x < sprite.x + sprite.width * sprite.blowLeft
              ) {
                player.velocity.y -= 0.2;
                // player.velocity.y -= Math.max(0.1, Math.min(6, power / distance));
                if (player.maxJump) {
                  // player.jumpCounter = player.maxJump-1;
                  // player.jumpAgain = true;
                }
              }
            }
          } else {
            if (
              Math.abs(
                player.x + player.width / 2 - sprite.x + sprite.width / 2
              ) <= 700 &&
              player.y + player.height >
                sprite.y + sprite.height * sprite.blowTop &&
              player.y < sprite.y + sprite.height * sprite.blowBottom
            ) {
              if (player.x < sprite.x && sprite.direction === DIRECTION.LEFT) {
                player.velocity.x -= 0.1;
              } else if (
                player.x > sprite.x &&
                sprite.direction === DIRECTION.RIGHT
              ) {
                player.velocity.x += 0.1;
              }
            }
          }
        });
      }

      if (sprite.blowCounter >= sprite.blowEnd) {
        sprite.blowCounter = 0;
        sprite.changeAnimation({ animation: "idle" });
      }
    },
  }, */

  "dies-if-falls": {
    do({ sprite }) {
      if (
        sprite.energy > 0 &&
        sprite.collisionData.bottom &&
        Math.abs(sprite.velocity.y) > 0.5
      ) {
        sprite.energy = 0;
      }
    },
  },

  dies: {
    init(sprite) {
      sprite.isDead = false;
    },
    do({ sprite }) {
      if (sprite.energy < 1) {
        sprite.changeAnimation({ animation: "dead" });
        if (sprite.isPlayer && !sprite.isDead) {
          postMessage({ type: "PLAY_SOUND", sound: "fail" });
          // sprite.isDead = true;
          // sprite.changePattern("dead");
        }
        sprite.isDead = true;
        sprite.changePattern("dead");
      }
    },
  },

  reborns: {
    init(sprite) {
      sprite.rebirthCounter = sprite.rebirthCounter || 0;
      sprite.rebirthWait = sprite.rebirthWait || 500;
      sprite.originalX = sprite.x;
      sprite.originalY = sprite.y;
    },
    do({ sprite }) {
      if (sprite.energy <= 0 && sprite.rebirthCounter === 0 && !sprite.hidden) {
        sprite.hidden = true;
        sprite.rebirthCounter = sprite.rebirthWait;
        postMessage({
          type: "PLAY_SOUND",
          sound: "collect",
          x: sprite.x,
          y: sprite.y,
        });
        postMessage({
          type: "EMIT_PARTICLES",
          particleTypeId: "crumb",
          amount: 10,
          particleProps: {
            x: sprite.x + sprite.width / 2,
            y: sprite.y + sprite.height / 2,
          },
        });
      } else if (sprite.rebirthCounter > 0) {
        sprite.rebirthCounter--;
      } else if (sprite.hidden) {
        sprite.x = sprite.originalX;
        sprite.y = sprite.originalY;
        sprite.hidden = false;
        sprite.energy = 1;
        postMessage({
          type: "PLAY_SOUND",
          sound: "pop",
          x: sprite.x,
          y: sprite.y,
        });
      }
    },
  },
};
