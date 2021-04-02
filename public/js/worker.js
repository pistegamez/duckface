'use strict';

// Do not remove these comments, they are used in build
// scripts-start
importScripts('/js/common.js');
importScripts('/js/behaviours.js');
// scripts-end

const ROUNDS_PER_SECOND = 80;
const ROUND_MAX_TIMEOUT_MS = Math.floor(1000 / ROUNDS_PER_SECOND);
const REPORT_FREQUENCY_MS = Math.floor(ROUND_MAX_TIMEOUT_MS / 2);

const statistics = {
    rounds: 0,
    ms: 0
}

setInterval(() => {
    statistics.rounds = 0;
    statistics.ms = 0;
}, 1000);

let state = {};
let mode = {
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
    left: false
}

onmessage = ({ data }) => {

    if (data.action === "SET_SCENE") {
        console.log("SET SCENE");
        tiles = [];
        sprites = [];
        state = {};
        scene = new Scene(data.scene);

        addSpriteTypes(data.spriteTypes);

        data.scene.sprites.forEach(sprite => {
            addSprite(sprite);
        });
        setTiles(data.scene.tiles);
    }
    else if (data.action === "RUN") {
        mode.run = true;
    }
    else if (data.action === "STOP") {
        mode.run = false;
    }
    else if (data.action === "START_CONTROL_UP") {
        controls.up = true;
    }
    else if (data.action === "START_CONTROL_RIGHT") {
        controls.right = true;
    }
    else if (data.action === "START_CONTROL_DOWN") {
        controls.down = true;
    }
    else if (data.action === "START_CONTROL_LEFT") {
        controls.left = true;
    }
    else if (data.action === "STOP_CONTROL_UP") {
        controls.up = false;
    }
    else if (data.action === "STOP_CONTROL_RIGHT") {
        controls.right = false;
    }
    else if (data.action === "STOP_CONTROL_DOWN") {
        controls.down = false;
    }
    else if (data.action === "STOP_CONTROL_LEFT") {
        controls.left = false;
    }
    else if (data.action === "ADD_TILE") {
        addTile(data.tile, tiles);
    }
    else if (data.action === "ADD_SPRITE") {
        addSprite(data.sprite);
    }
    else if (data.action === "DELETE") {
        tiles = tiles.filter(tile => !data.tileIds.includes(tile.id));
        sprites = sprites.filter(sprite => !data.spriteIds.includes(sprite.id));
    }
    else if (data.action === "UPDATE") {
        console.log("UPDATE SCENE");
        setTiles(data.tiles);
        if (data.sprites) {
            data.sprites.forEach(sprite => {
                const index = sprites.findIndex(s => s.id === sprite.id);
                sprites[index] = new Sprite(sprite);
            });
        }
    }
    else if (data.action === "PAUSE_ON") {
        mode.pause = true;
    }
    else if (data.action === "PAUSE_OFF") {
        mode.pause = false;
    }
}

function addSpriteTypes(types) {
    for (let i in types) {
        const patterns = JSON.parse(JSON.stringify(types[i].patterns));

        for (let pattern in patterns) {
            const behaviourList = [];
            patterns[pattern].behaviours.forEach(name => {
                if (behaviours[name]) {
                    behaviourList.push(behaviours[name]);
                }
                else {
                    console.error(`Behaviour ${name} not found for type ${i}`);
                }
            });
            patterns[pattern].behaviours = behaviourList;
        }

        spriteTypes[i] = new SpriteType({
            ...types[i],
            patterns
        });
    }
}

function addSprite(data) {
    const sprite = new Sprite(data);
    sprites.push(sprite);
}

function setTiles(dataTiles) {

    if (dataTiles === undefined) {
        return;
    }
    if (dataTiles.length === 0) {
        tiles = [];
        return;
    }

    if (dataTiles.length === 1) {
        tiles = [new Tile(dataTiles[0])];
        return;
    }

    tiles = [];

    while (tiles.length < dataTiles.length) {

        if (tiles.length > 0) {
            dataTiles = [...tiles];
            tiles = [];
        }

        dataTiles.forEach(tile => {
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

        let tile = tiles[i];

        if (data.shape === SHAPES.BOX && tile.shape === SHAPES.BOX) {
            // tile is inside another
            if (data.x >= tile.x && data.x + data.width <= tile.x + tile.width
                && data.y >= tile.y && data.y + data.height <= tile.y + tile.height) {
                //console.log(`tile ${data.id} removed: inside tile ${tile.id}`);
                return;
            }
            // tiles inside this tile
            if (data.x <= tile.x && data.x + data.width >= tile.x + tile.width
                && data.y <= tile.y && data.y + data.height >= tile.y + tile.height) {
                tile.x = data.x;
                tile.y = data.y;
                tile.width = data.width;
                tile.height = data.height;
                //console.log(`tile ${data.id} removed: size merged to tile ${tile.id}`);
                return;
            }
            // same left, same height
            if (data.x === tile.x + tile.width
                && data.y === tile.y
                && data.y + data.height === tile.y + tile.height) {
                tile.width += data.width;
                //console.log(`tile ${data.id} removed: width merged to tile ${tile.id}`);
                return;
            }
            // same right, same height
            if (data.x + data.width === tile.x
                && data.y === tile.y
                && data.y + data.height === tile.y + tile.height) {
                tile.x = data.x;
                tile.width += data.width;
                //console.log(`tile ${data.id} removed: width merged to tile ${tile.id}`);
                return;
            }
            // same bottom, same width
            if (data.y + data.height === tile.y
                && data.x === tile.x
                && data.x + data.width === tile.x + tile.width) {
                tile.y = data.y;
                tile.height += data.height;
                //console.log(`tile ${data.id} removed: height merged to tile ${tile.id}`);
                return;
            }
            // same top, same width
            if (data.y === tile.y + tile.height
                && data.x === tile.x
                && data.x + data.width === tile.x + tile.width) {
                tile.height += data.height;
                //console.log(`tile ${data.id} removed: height merged to tile ${tile.id}`);
                return;
            }
        }

    }

    tiles.push(new Tile(data));
}

function mainloop() {

    const startMs = Date.now();

    if (!mode.pause && mode.run) {

        nextState = {
            completed: true,
            failed: true,
            forceFail: false
        };

        move();
        collide();
        animate();

        if (nextState.forceFail === true) {
            nextState.failed = true;
            nextState.completed = false;
        }

        state = nextState;

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
        statistics
    });
}

function animate() {

    sprites.forEach(sprite => {
        sprite.animate(ROUNDS_PER_SECOND);
    });
}

function move() {

    let removeSprites = false;

    sprites.forEach(sprite => {

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
                    sprite.velocity.x *= 0.97;
                }
                else {
                    let inertia = 1;
                    sprite.collisionData.tileIds.forEach(tileId => {
                        const tile = tiles.find(tile => tile.id === tileId);
                        inertia = Math.min(inertia, tileMaterials[tile.materialId].inertia);
                    });
                    sprite.velocity.x *= inertia;
                }
            }
            else {

                if (sprite.velocity.x > 0) {
                    sprite.velocity.x -= sprite.velocity.x / 150;
                }
                else if (sprite.velocity.x < 0) {
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
                }
                else if (sprite.y <= scene.top) {
                    sprite.y += scene.height;
                }
            }

            if (scene.horizontalLoop) {
                if (sprite.x + sprite.width >= scene.right) {
                    sprite.x -= scene.width;
                }
                else if (sprite.x <= scene.left) {
                    sprite.x += scene.width;
                }
            }

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
        sprites = sprites.filter(sprite => !sprite.remove);
    }
}


function collide() {

    tiles.forEach(tile => {
        tile.collision = false;
    });

    sprites.forEach(sprite => {
        sprite.resetCollisionData();
    });

    sprites.forEach(sprite => {
        if (!sprite.hidden) {
            testCollisions(sprite, sprites.filter(sprite => !sprite.hidden));
        }
    });

    sprites.forEach(sprite => {
        sprite.x = sprite.collisionData.x;
        sprite.y = Math.floor(sprite.collisionData.y);
    });

    sprites.forEach(sprite => {
        if (spriteTypes[sprite.typeId].collidesWithObstacles) {
            testCollisions(sprite, tiles);
        }
    });

    sprites.forEach(sprite => {
        sprite.x = sprite.collisionData.x;
        //sprite.collisionData.y = Math.ceil(sprite.collisionData.y);
        //sprite.y = Math.round(sprite.collisionData.y);
        sprite.y = Math.floor(sprite.collisionData.y);
        sprite.velocity.x = sprite.collisionData.velocity.x;
        sprite.velocity.y = sprite.collisionData.velocity.y;
    });
}

function testCollisions(sprite, targets) {
    let rounds = 7;
    let collision = null;

    do {
        collision = null;

        for (let i = 0; i < targets.length; i++) {

            let target = targets[i];

            if (sprite !== target
                && !sprite.collisionData.spriteIds.has(target.id)
                && !sprite.collisionData.tileIds.has(target.id)) {

                let targetShape = target.isSprite ? spriteTypes[target.typeId].shape : target.shape;
                let spriteShape = spriteTypes[sprite.typeId].shape;

                if (spriteShape === SHAPES.BOX || spriteShape === SHAPES.TOP_DOWN) {
                    if ((targetShape === SHAPES.BOX || targetShape === SHAPES.TOP_DOWN)
                        && checkBoxToBoxCollision(sprite.collisionData, target)) {

                        // movedByOtherSprites

                        if (target.isTile && target.isObstacle && spriteTypes[sprite.typeId].collidesWithObstacles) {
                            let area = calculatePenetrationArea(sprite.collisionData, target);
                            if (collision === null || collision.area.size < area.size) {
                                collision = { target, area, targetShape };
                            }
                        }
                        else if (target.isSprite && spriteTypes[sprite.typeId].movedByOtherSprites && target.isObstacle && spriteTypes[sprite.typeId].collidesWithObstacles) {
                            let area = calculatePenetrationArea(sprite.collisionData, target);
                            if (collision === null || collision.area.size < area.size) {
                                collision = { target, area, targetShape };
                            }
                        }
                        else if (target.isSprite) {
                            sprite.collisionData.spriteIds.add(target.id);
                            if (target.isPlayer) {
                                sprite.collisionData.playerHits++;
                            }
                            if (target.isEnemy) {
                                sprite.collisionData.enemyHits++;
                            }
                        }
                        else if (target.isTile) {
                            sprite.collisionData.tileIds.add(target.id);
                        }
                    }
                    else if (targetShape === SHAPES.CIRCLE && checkBoxToCircleCollision(sprite.collisionData, target)) {
                        if (target.isSprite) {
                            sprite.collisionData.spriteIds.add(target.id);
                            if (target.isPlayer) {
                                sprite.collisionData.playerHits++;
                            }
                            if (target.isEnemy) {
                                sprite.collisionData.enemyHits++;
                            }
                        }
                    }
                    else if (targetShape === SHAPES.SLOPE_LEFT || targetShape === SHAPES.SLOPE_RIGHT) {
                        if (checkBoxMiddleToBoxCollision(sprite.collisionData, target)) {
                            if (checkBoxToSlopeCollision(sprite.collisionData, target)) {

                                let area = calculateSlopePenetrationArea(sprite.collisionData, target);
                                //if (collision === null || collision.area.size < area.size) {
                                collision = { target, area, targetShape };
                                //}
                            }
                            rounds = 0;
                            break;
                        }
                    }
                }
                else if (spriteShape === SHAPES.CIRCLE) {
                    if (targetShape === SHAPES.BOX && checkBoxToCircleCollision(target, sprite.collisionData)) {
                        if (target.isSprite) {
                            sprite.collisionData.spriteIds.add(target.id);
                            if (target.isPlayer) {
                                sprite.collisionData.playerHits++;
                            }
                            if (target.isEnemy) {
                                sprite.collisionData.enemyHits++;
                            }
                        }
                    }
                }
            }
        };

        if (collision !== null) {

            sprite.collision = true;

            if (collision.target.isSprite) {
                sprite.collisionData.spriteIds.add(collision.target.id);
                if (collision.target.isPlayer) {
                    sprite.collisionData.playerHits++;
                }
                if (collision.target.isEnemy) {
                    sprite.collisionData.enemyHits++;
                }
            }
            else if (collision.target.isTile) {
                sprite.collisionData.tileIds.add(collision.target.id);
            }


            if (sprite.isStatic) {
            }
            else if (collision.targetShape === SHAPES.TOP_DOWN) {
                if (sprite.velocity.y >= 0
                    && sprite.y + sprite.height - 5 <= collision.target.y) {
                    sprite.collisionData.bottom = true;
                    sprite.collisionData.y -= collision.area.height;
                    if (sprite.velocity.y >= 3) {
                        sprite.collisionData.velocity.y = Math.min(-sprite.velocity.y / 4, sprite.collisionData.velocity.y);
                        postMessage({ type: "PLAY_SOUND", sound: "bump", x: sprite.x + sprite.width / 2, y: sprite.y + sprite.height / 2 });
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
                                    y: 0
                                }
                            }
                        });

                    }
                    else if (sprite.velocity.y > 0) {
                        sprite.collisionData.velocity.y = Math.min(0, sprite.collisionData.velocity.y);
                    }
                }
            }
            else if (collision.area.width > collision.area.height) {

                if (sprite.y < collision.target.y
                    || collision.targetShape === SHAPES.SLOPE_LEFT
                    || collision.targetShape === SHAPES.SLOPE_RIGHT) {

                    sprite.collisionData.bottom = true;

                    if (collision.target.isSprite) {

                        //sprite.collisionData.velocity.y += Math.min(-30, collision.target.velocity.y * 2);
                        //sprite.collisionData.velocity.y = -30;//Math.min(-30, collision.target.velocity.y * 2);
                        sprite.collisionData.velocity.y = Math.min(sprite.collisionData.velocity.y, collision.target.velocity.y);

                        if (collision.target.velocity.x !== 0) {
                            //let colPercentage = collision.area.width / sprite.width;

                            if (collision.target.velocity.x > 0 && sprite.collisionData.velocity.x < collision.target.velocity.x) {
                                sprite.collisionData.velocity.x += 0.1;
                            }
                            else if (collision.target.velocity.x < 0 && sprite.collisionData.velocity.x > collision.target.velocity.x) {
                                sprite.collisionData.velocity.x -= 0.1;
                            }
                            //sprite.collisionData.velocity.x += collision.target.velocity.x * 0.2;
                        }
                    }

                    //sprite.collisionArea = collision.area;

                    sprite.collisionData.y -= Math.round(collision.area.height);

                    //if (sprite.velocity.y > 0) {

                    if (sprite.velocity.y >= 4) {
                        sprite.collisionData.velocity.y = Math.min(-sprite.velocity.y / 4, sprite.collisionData.velocity.y);
                        //postMessage({ type: "PLAY_SOUND", sound: "pt" });
                        postMessage({ type: "PLAY_SOUND", sound: "bump", x: sprite.x + sprite.width / 2, y: sprite.y + sprite.height / 2 });
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
                                    y: 0
                                }
                            }
                        });
                    }
                    else if (sprite.velocity.y > 0) {
                        sprite.collisionData.velocity.y = Math.min(0, sprite.collisionData.velocity.y);
                    }
                    //}

                    if (collision.targetShape === SHAPES.SLOPE_LEFT) {
                        sprite.collisionData.velocity.x -= 0.25 / (collision.target.width / collision.target.height);
                    }
                    else if (collision.targetShape === SHAPES.SLOPE_RIGHT) {
                        sprite.collisionData.velocity.x += 0.25 / (collision.target.width / collision.target.height);
                    }
                }
                else {
                    sprite.collisionData.top = true;

                    if (sprite.velocity.y <= -3) {
                        sprite.collisionData.velocity.y = Math.max(-sprite.velocity.y / 4, sprite.collisionData.velocity.y);
                        postMessage({ type: "PLAY_SOUND", sound: "bump", x: sprite.x + sprite.width / 2, y: sprite.y + sprite.height / 2 });
                        postMessage({
                            type: "EMIT_PARTICLES",
                            particleTypeId: "star",
                            amount: 5,
                            particleProps: {
                                x: sprite.x + sprite.width / 2,
                                y: sprite.y,
                                energy: sprite.velocity.y / 6,
                            }
                        });
                    }
                    else if (sprite.velocity.y < 0) {
                        sprite.collisionData.velocity.y = Math.max(0, sprite.collisionData.velocity.y);
                    }

                    sprite.collisionData.y += collision.area.height;
                }
            }
            else {

                if (sprite.x < collision.target.x) {
                    sprite.collisionData.right = true;

                    if (collision.target.isTile) {
                        sprite.collisionData.x -= collision.area.width;
                    }
                    else if (Math.abs(sprite.velocity.x) >= Math.abs(collision.target.velocity.x)) {
                        sprite.collisionData.x -= collision.area.width;
                    }

                    if (sprite.velocity.x >= 1) {
                        sprite.collisionData.velocity.x = Math.min(-sprite.velocity.x / 2, sprite.collisionData.velocity.x);
                        postMessage({ type: "PLAY_SOUND", sound: "bump", x: sprite.x + sprite.width / 2, y: sprite.y + sprite.height / 2 });
                    }
                    else if (sprite.velocity.x > 0) {
                        sprite.collisionData.velocity.x = 0;
                    }
                }
                else {
                    sprite.collisionData.left = true;

                    if (collision.target.isTile) {
                        sprite.collisionData.x += collision.area.width;
                    }
                    else if (Math.abs(sprite.velocity.x) >= Math.abs(collision.target.velocity.x)) {
                        sprite.collisionData.x += collision.area.width;
                    }

                    if (sprite.velocity.x <= -1) {
                        sprite.collisionData.velocity.x = Math.max(-sprite.velocity.x / 2, sprite.collisionData.velocity.x);
                        postMessage({ type: "PLAY_SOUND", sound: "bump", x: sprite.x + sprite.width / 2, y: sprite.y + sprite.height / 2 });
                    }
                    else if (sprite.velocity.x < 0) {
                        sprite.collisionData.velocity.x = 0;//Math.max(0, sprite.collisionData.velocity.x);
                    }
                }


                if (collision.target.isSprite) {
                    let colPercentage = Math.min(1, collision.target.height / sprite.height);
                    sprite.collisionData.velocity.x += (collision.target.velocity.x / 1.1) * colPercentage;
                }
            }

            collision.target.collision = true;
        }
        rounds--;
    } while (collision !== null && rounds > 0);

    // if (rounds === 0) {
    //    console.log('xxx')
    //}
}

function checkBoxToBoxCollision(box1, box2) {
    if (box2.isTile) {
        return (box1.r >= box2.l && box1.l <= box2.r &&
            box1.b >= box2.t && box1.t <= box2.b);
    }
    return (box1.r >= box2.collisionData.l && box1.l <= box2.collisionData.r &&
        box1.b >= box2.collisionData.t && box1.t <= box2.collisionData.b);
}

// FIXME: Use collisionData.l,r,t,b instead of x + width and y + height
function checkBoxMiddleToBoxCollision(box, slope) {
    return (box.x + box.width / 2 >= slope.x && box.x + box.width / 2 <= slope.x + slope.width &&
        box.y + box.height >= slope.y && box.y <= slope.y + slope.height);
}

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

function calculatePenetrationArea(box1, box2) {
    let area = {};

    area.left = Math.max(
        box1.l,
        box2.isSprite ? box2.collisionData.l : box2.x
    );
    area.right = Math.min(
        box1.r,
        box2.isSprite ? box2.collisionData.r : box2.x + box2.width
    );
    area.top = Math.max(
        box1.t,
        box2.isSprite ? box2.collisionData.t : box2.y,
    );
    area.bottom = Math.min(
        box1.b,
        box2.isSprite ? box2.collisionData.b : box2.y + box2.height, 
    );
    area.width = area.right - area.left;
    area.height = area.bottom - area.top;
    area.size = area.width * area.height;
    return area;
}

function calculatePenetrationAreaOld(box1, box2) {
    let area = {};
    area.left = Math.max(box2.x, box1.x);
    area.right = Math.min(box2.x + box2.width, box1.x + box1.width);
    area.top = Math.max(box2.y, box1.y);
    area.bottom = Math.min(box1.y + box1.height, box2.y + box2.height);
    area.width = area.right - area.left;
    area.height = area.bottom - area.top;
    area.size = area.width * area.height;
    return area;
}

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
}