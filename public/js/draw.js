'use strict';

let tileCanvases = {};
let canvasScale = 1;

let grainImage;
let bgEffectCanvas;

const effects = { redraw: true };

const tileLayers = { update: true };

let buttons = {};

let showSpriteInfo = false;

function updateTileCanvases(drawAll = false) {

    const zx = typeof editor !== "undefined" ? 0 : camera.pixelX;
    const zy = typeof editor !== "undefined" ? 0 : camera.pixelY;

    if (drawAll) {
        tileCanvases = {};
    }

    scene.tiles
        .filter(tile =>
            drawAll || (
                tile.x + tile.width >= camera.pixelX + zx * tile.z
                && tile.y + tile.height >= camera.pixelY + zy * tile.z
                && tile.x <= camera.pixelX + zx * tile.z + canvas.width
                && tile.y <= camera.pixelY + zy * tile.z + canvas.height
            )
        )
        .forEach(tile => {
            updateTileCanvas(tile);
        });
}

function updateTileCanvas(tile, forceRedraw = false) {

    if (tileCanvases[tile.id] === undefined) {
        let canvas = document.createElement("canvas");
        let context = canvas.getContext('2d');
        canvas.width = tile.width * canvasScale + 4;
        canvas.height = tile.height * canvasScale + 4;
        //context.scale(canvasScale,canvasScale);
        tileCanvases[tile.id] = {
            canvas,
            context,
            redraw: true
        };
    }

    let tileCanvas = tileCanvases[tile.id];

    if (tileCanvas.redraw || forceRedraw) {
        tileCanvas.canvas.width = tile.width * canvasScale + 4;
        tileCanvas.canvas.height = tile.height * canvasScale + 4;

        tileCanvas.context.clearRect(0, 0, tileCanvas.width, tileCanvas.height);
        tileCanvas.context.translate(2, 2);
        drawTile(tile, tileCanvas.context);
        tileCanvas.context.translate(-2, -2);
        if (!tile.hasBorders) {
            tileCanvas.redraw = false;
        }
    }
}

function removeTileCanvasById(id) {
    if (tileCanvases[id] !== undefined) {
        tileCanvases[id].canvas.height = 0;
        tileCanvases[id].canvas.width = 0;
        tileCanvases[id] = undefined;
    }
}

function draw() {

    context.save();

    if (canvasScale !== 1) {
        context.scale(canvasScale, canvasScale);
        context.translate(canvas.width / -canvasScale, canvas.height / -canvasScale);
    }
    canvas.style.cursor = null;

    const fadeTime = Date.now() - gameState.stateStartTime;

    if (fadeTime < 1000) {
        /*
        context.globalAlpha = 1 - fadeTime/1000;
        context.drawImage(gameState.fadeCanvas,0,0);
        context.globalAlpha = 1;
        */
        context.drawImage(gameState.fadeCanvas, 0, 0);
        context.beginPath();
        context.arc(canvas.width / 2, canvas.height / 2, 10 + fadeTime / 2, 0, Math.PI * 2);
        context.lineWidth = 4;
        context.strokeStyle = "#303030";
        context.stroke();
        context.clip();

    }

    if (gameState.state === STATES.TITLE) {
        drawTitleScreen();
    }
    else if (gameState.state === STATES.PLAY) {
        drawGame();
    }
    else if (gameState.state === STATES.END) {
        drawEnd();
    }

    if (grain && typeof editor === "undefined") {
        drawGrain();
    }

    context.restore();

    frames++;
}

function drawGrain() {
    context.globalCompositeOperation = "overlay";

    if (!grainImage) {
        grainImage = document.getElementById("grain");
    }

    drawScrollingImage(context, grainImage);
    /*
    let cameraX = camera.pixelX >= 0 ? camera.pixelX % 800 : 800 - (-camera.pixelX % 800);
    let cameraY = camera.pixelY >= 0 ? camera.pixelY % 600 : 600 - (-camera.pixelY % 600);

    drawImage(context, grainImage, -cameraX, -cameraY);
    drawImage(context, grainImage, -cameraX, -cameraY + 600);
    drawImage(context, grainImage, -cameraX + 800, -cameraY);
    drawImage(context, grainImage, -cameraX + 800, -cameraY + 600);
    */
}

function drawScrollingImage(context, image, x = 0, y = 0, z = 1) {
    let cameraX = x + camera.pixelX * z >= 0 ? (x + camera.pixelX * z) % 800 : 800 - (-(x + camera.pixelX * z) % 800);
    let cameraY = y + camera.pixelY * z >= 0 ? (y + camera.pixelY * z) % 600 : 600 - (-(y + camera.pixelY * z) % 600);

    drawImage(context, image, -cameraX, -cameraY);
    drawImage(context, image, -cameraX, -cameraY + 600);
    drawImage(context, image, -cameraX + 800, -cameraY);
    drawImage(context, image, -cameraX + 800, -cameraY + 600);
}

function drawImage(context, image, x, y) {
    if (x < context.canvas.width && y < context.canvas.height && x + image.width >= 0 && y + image.height >= 0) {
        context.drawImage(image, x, y);
    }
}

function drawGame() {

    randoms.reset();

    context.lineCap = "butt";
    context.lineJoin = "miter";

    if (effects.redraw) {
        clearEffects();
    }

    drawBackground(context, canvas);

    drawEffects(context, LAYERS.BACKGROUND);

    if (!state.completed || typeof editor !== "undefined") {
        drawTileLayer(LAYERS.BACKGROUND, context, canvas);
    }

    drawEffects(context, LAYERS.MIDDLE);

    context.translate(-camera.pixelX, -camera.pixelY);
    drawSprites(context, canvas);
    drawParticles(context, canvas);
    context.translate(camera.pixelX, camera.pixelY);

    drawTileLayer(LAYERS.MIDDLE, context, canvas);

    drawEffects(context, LAYERS.FOREGROUND);

    tileLayers.update = false;
    effects.redraw = false;

    if (showSpriteInfo) {
        context.translate(-camera.pixelX, -camera.pixelY);
        drawSpriteInfo(context);
        context.translate(camera.pixelX, camera.pixelY);
    }

    if (typeof editor !== "undefined") {
        drawEditorStuff();
    }
    else {
        drawCaptions();

        if (sceneLoading && (Date.now() - sceneLoadingStartedTime) > 1000) {
            drawCaption({ text: "Loading", y: 0.5 });
        }
        else {
            drawGameButtons();
        }
    }
}

function drawGameButtons(context) {
    if (state.completed && Date.now() - (sceneStartTime + sceneCompletionTime) > 2000) {
        drawButton("complete-try-again", "Try again (R)", 0.5, 0.34, () => {
            resetScene();
        });

        drawButton("next", "Next (Enter)", 0.5, 0.50, () => {
            openNext();
        });

        drawButton("replay", "Watch replay", 0.5, 0.66, () => {
            replayScene();
        });
    }
    else if (state.failed === true && Date.now() - (sceneStartTime + sceneFailedTime) > 2000) {
        drawButton("failed-try-again", "Try again (Enter)", 0.5, 0.42, () => {
            resetScene();
        });
        drawButton("failed-replay", "Watch replay", 0.5, 0.58, () => {
            replayScene();
        });
    }
    else {
        buttons = {};
    }
}

function drawButton(id, text, x = 0.5, y = 0.5, callback) {

    if (buttons[id] === undefined) {
        buttons[id] = { clicked: false };
    }

    const fontSize = 32;
    context.lineWidth = 2.0;
    context.font = `${fontSize}px ${FONT_FAMILY}`;
    const textWidth = context.measureText(text).width;
    const padding = 25;

    const left = canvas.width * x - (textWidth / 2) - padding;
    const right = left + textWidth + padding * 2;
    const top = canvas.height * y - padding - fontSize / 2;
    const bottom = top + fontSize + padding * 2 - fontSize / 2;

    // button shadow
    context.fillStyle = "rgba(48,48,48,0.5)";
    context.beginPath();
    context.moveTo(left + 3 + randoms.nextValue, bottom + randoms.nextValue);
    context.lineTo(right - 3 + randoms.nextValue, bottom + randoms.nextValue);
    context.lineTo(right - 3 + randoms.nextValue, bottom + 3 + randoms.nextValue);
    context.lineTo(left + 3 + randoms.nextValue, bottom + 3 + randoms.nextValue);
    context.closePath();
    context.fill();

    // button
    context.strokeStyle = "#303030";
    context.fillStyle = "#58d058";
    context.beginPath();
    context.moveTo(left + randoms.nextValue, top + randoms.nextValue);
    context.lineTo(right + randoms.nextValue, top + randoms.nextValue);
    context.lineTo(right + randoms.nextValue, bottom + randoms.nextValue);
    context.lineTo(left + randoms.nextValue, bottom + randoms.nextValue);
    context.closePath();
    context.stroke();
    context.fill();
    context.beginPath();
    context.moveTo(left + randoms.nextValue, top + randoms.nextValue);
    context.lineTo(right + randoms.nextValue, top + randoms.nextValue);
    context.lineTo(right + randoms.nextValue, bottom + randoms.nextValue);
    context.lineTo(left + randoms.nextValue, bottom + randoms.nextValue);
    context.closePath();
    context.stroke();

    // button text
    context.fillStyle = "#ffffff";
    context.fillText(text, left + padding, y * canvas.height);

    // button shading
    context.strokeStyle = "#ffffff";
    context.beginPath();
    context.moveTo(left + 10 + randoms.nextValue, top + 8 + randoms.nextValue);
    context.lineTo(left + 8 + randoms.nextValue, top + 10 + randoms.nextValue);
    context.stroke();

    context.lineWidth = 1.5;
    context.strokeStyle = "#303030";
    context.beginPath();
    context.moveTo(right - 4 + randoms.nextValue, bottom - 8 + randoms.nextValue);
    context.lineTo(right - 8 + randoms.nextValue, bottom - 4 + randoms.nextValue);
    context.moveTo(right - 4 + randoms.nextValue, bottom - 12 + randoms.nextValue);
    context.lineTo(right - 6 + randoms.nextValue, bottom - 10 + randoms.nextValue);
    context.stroke();

    // button click
    if (controls.mousePixelX >= left && controls.mousePixelX <= right && controls.mousePixelY >= top && controls.mousePixelY <= bottom) {
        canvas.style.cursor = "pointer";
        if (controls.mouseLeft && !buttons[id].clicked) {
            buttons[id].clicked = true;
            callback();
        }
    }
    // touch
    else if (controls.touchX >= left && controls.touchX <= right && controls.touchY >= top && controls.touchY <= bottom) {
        if ((controls.leftTouch || controls.rightTouch) && !buttons[id].clicked) {
            buttons[id].clicked = true;
            callback();
        }
    }
    else {
        buttons[id].clicked = false;
    }
}

function drawTitleScreen() {

    context.setLineDash([]);

    context.fillStyle = scene.bgColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawTitle({ text: "Duckface", fontSize: 120, fillStyle: "#ffc080", y: 0.2, shadow: true, lineWidth: 2.5 });

    drawTitle({ text: "Level " + (album.scenes.findIndex(s => s.id === scene.id) + 1) + " of " + album.scenes.length, fontSize: 30, fillStyle: "#ffffff", y: 0.35 });
    drawTitle({ text: scene.title, fontSize: 55, fillStyle: "#ffc080", y: 0.45, lineWidth: 2 });
    if (scene.author) {
        drawTitle({ text: "by", fontSize: 30, fillStyle: "#ffffff", y: 0.52 });
        drawTitle({ text: scene.author, fontSize: 40, fillStyle: "#ffffff", y: 0.6 });
    }

    if (scene.themeSong) {
        drawTitle({ text: "Music: " + themes[scene.themeSong].title, fontSize: 25, fillStyle: "#ffffff", y: 0.85, lineWidth: 1.5 });
        drawTitle({ text: "by: " + themes[scene.themeSong].authors, fontSize: 25, fillStyle: "#ffffff", y: 0.9, lineWidth: 1.5 });
    }
}

function drawTitle({ text, fillStyle = "#303030", shadow = false, fontSize, y = 0.5, lineWidth = 1.75 }) {
    context.font = `${fontSize}px ${FONT_FAMILY}`;
    const textWidth = context.measureText(text).width;

    context.strokeStyle = "#303030";

    context.fillStyle = "#303030";
    for (let i = 0; i < 1; i += 0.1) {

        context.fillText(
            text,
            canvas.width / 2 - textWidth / 2 + Math.sin(i * Math.PI * 2) * lineWidth,
            canvas.height * y + Math.cos(i * Math.PI * 2) * lineWidth
        );
    }

    if (shadow) {
        context.fillStyle = "#303030";
        context.fillText(text, canvas.width / 2 - textWidth / 2, canvas.height * y + 5);
    }
    context.fillStyle = fillStyle;
    context.fillText(text, canvas.width / 2 - textWidth / 2, canvas.height * y);
}

function drawBackground(context, canvas) {

    if (!state.completed || !isPlayerReady || typeof editor !== "undefined") {
        context.fillStyle = scene.bgColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
        return;
    }

    context.globalAlpha = Math.min(1, (Date.now() - (sceneStartTime + sceneCompletionTime)) / 1000);

    let h = ((Date.now() - sceneLoadedTime) / 10) % 360;
    const step = 10;
    context.fillStyle = `hsl(${h},30%,50%)`;
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (let r = canvas.width / 2 + 80; r > step; r -= step) {
        h = (h + 20) % 360;
        context.beginPath();
        context.fillStyle = `hsl(${h},70%,60%)`;
        context.arc(
            canvas.width / 2 + Math.sin((r / step) + ((Date.now() - sceneLoadedTime) / 500)) * 8,
            canvas.height / 2 + Math.cos((r / step) + ((Date.now() - sceneLoadedTime) / 500)) * 8,
            r,
            0,
            Math.PI * 2
        );
        context.closePath;
        context.fill();
    }

    context.globalAlpha = 1;

}

function clearEffects() {
    effects.canvas = {};
}

function drawEffects(context, layer = LAYERS.BACKGROUND) {

    if (!state.completed || !isPlayerReady) {

        scene.effects.filter(fx => fx.layer === layer).forEach(fx => {
            if (fx.type === "rain") {
                drawRain(fx.id, context, fx.props);
            }
            else if (fx.type === "lightning") {
                drawLightning(context, fx.props);
            }
            else if (fx.type === "stars") {
                drawStars(fx.id, context, fx.props);
            }
            else if (fx.type === "clouds") {
                drawClouds(fx.id, context, fx.props);
            }
            else if (fx.type === "sun") {
                drawSun(fx.id, context, fx.props);
            }
        });
    }
}

function drawStars(id, context, { stars = 200, color = "#ffffff" }) {

    if (!effects.canvas[id]) {
        effects.canvas[id] = document.createElement('canvas');
        effects.canvas[id].width = context.canvas.width;
        effects.canvas[id].height = context.canvas.height;
    }

    if (effects.redraw) {
        const bgEffectContext = effects.canvas[id].getContext('2d');
        bgEffectContext.clearRect(0, 0, effects.canvas[id].width, effects.canvas[id].height);
        bgEffectContext.fillStyle = color;

        for (let i = 0; i < stars; i++) {
            const x = Math.random() * effects.canvas[id].width;
            const y = Math.random() * effects.canvas[id].height;
            const radius = Math.random() * 2;
            bgEffectContext.beginPath();
            bgEffectContext.arc(x, y, radius, 0, Math.PI * 2, false);
            bgEffectContext.fill();
        }
    }

    context.drawImage(effects.canvas[id], 0, 0);
}

function drawSun(id, context, { x = 0.5, y = 0.5, radius = 80, color = "#f8f890", stroke = "#f8f890" }) {

    if (!effects.canvas[id]) {
        effects.canvas[id] = document.createElement('canvas');
        effects.canvas[id].width = context.canvas.width;
        effects.canvas[id].height = context.canvas.height;
    }

    if (effects.redraw) {
        const bgEffectContext = effects.canvas[id].getContext('2d');
        bgEffectContext.clearRect(0, 0, effects.canvas[id].width, effects.canvas[id].height);
        bgEffectContext.fillStyle = color;
        bgEffectContext.strokeStyle = stroke;
        bgEffectContext.lineWidth = 1;
        bgEffectContext.globalAlpha = 1;

        bgEffectContext.beginPath();
        bgEffectContext.arc(
            effects.canvas[id].width * x,
            effects.canvas[id].height * y,
            radius,
            0, Math.PI * 2,
            false);
        bgEffectContext.fill();




        for (let i = 0; i < 16; i++) {
            bgEffectContext.globalAlpha = (16 - i) / 16;
            bgEffectContext.setLineDash([4 + Math.random() * 4, 2 + i / 2, 2, 2, 2 + Math.random() * 16, 2 + i / 2 + randoms.nextValue]);
            bgEffectContext.beginPath();
            bgEffectContext.arc(
                effects.canvas[id].width * x + randoms.nextValue,
                effects.canvas[id].height * y + randoms.nextValue,
                radius + randoms.nextValue + (i * i),
                0, Math.PI * 2,
                false);
            bgEffectContext.stroke();
        }


    }

    context.drawImage(effects.canvas[id], 0, 0);
}

function drawClouds(id, context, { clouds = 10, color = "#fbfbfb", stroke = "#e8e8e8", z = 0.5, speed = 0.01, opacity = 1, yLimit = 0.5 }) {
    if (!effects.canvas[id]) {
        effects.canvas[id] = document.createElement('canvas');
        effects.canvas[id].width = context.canvas.width;
        effects.canvas[id].height = context.canvas.height;
    }

    if (effects.redraw) {
        const bgEffectContext = effects.canvas[id].getContext('2d');
        bgEffectContext.clearRect(0, 0, effects.canvas[id].width, effects.canvas[id].height);
        bgEffectContext.fillStyle = color;
        bgEffectContext.strokeStyle = stroke;
        bgEffectContext.lineWidth = 2.0;


        for (let i = 0; i < clouds; i++) {
            const width = Math.ceil(50 + Math.random() * 100);
            const height = Math.ceil(10 + Math.random() * width / 2);
            const x = Math.floor(Math.random() * (effects.canvas[id].width - width));
            const y = Math.floor(Math.random() * effects.canvas[id].height * yLimit) - 50;


            bgEffectContext.beginPath();
            //bgEffectContext.rect(x, y, width, height);
            bgEffectContext.moveTo(x + randoms.nextValue, y + randoms.nextValue);
            bgEffectContext.lineTo(x + randoms.nextValue + width, y + randoms.nextValue);
            bgEffectContext.lineTo(x + randoms.nextValue + width, y + height + randoms.nextValue);
            bgEffectContext.lineTo(x + randoms.nextValue, y + height + randoms.nextValue);
            bgEffectContext.closePath();
            bgEffectContext.fill();
            bgEffectContext.stroke();

            bgEffectContext.beginPath();
            bgEffectContext.moveTo(x + width - 5, y + height - 8);
            bgEffectContext.lineTo(x + width - 8, y + height - 5);
            bgEffectContext.moveTo(x + width - 11, y + height - 7);
            bgEffectContext.lineTo(x + width - 13, y + height - 5);

            bgEffectContext.stroke();


            const bumbs = Math.ceil(Math.random() * width / 20);


            bgEffectContext.lineWidth = 1.5;
            for (let j = 0; j < bumbs; j++) {
                const bwidth = Math.ceil(5 + Math.random() * width / 2);
                const bheight = Math.ceil(10 + Math.random() * 10);
                const bx = Math.floor(x + (width - bwidth) * Math.random());
                const by = Math.ceil(y - bheight + Math.random() * bheight / 3) + j * bheight / 5;

                bgEffectContext.beginPath();
                bgEffectContext.moveTo(bx + randoms.nextValue, by + randoms.nextValue + bheight);
                bgEffectContext.lineTo(bx + randoms.nextValue, by + randoms.nextValue);
                bgEffectContext.lineTo(bx + randoms.nextValue + bwidth, by + randoms.nextValue);
                bgEffectContext.lineTo(bx + randoms.nextValue + bwidth, by + randoms.nextValue + bheight);
                bgEffectContext.fill();
                bgEffectContext.stroke();
                /*
                bgEffectContext.rect(
                    x + j/bumbs + Math.random()*20, 
                    y + Math.random()*20 - Math.random()*20, 
                    5 + Math.random()*10, 
                    5 + Math.random()*10
                );*/



            }



        }

    }

    const x = ((Date.now() - sceneLoadedTime) * speed) % effects.canvas[id].width;

    //context.drawImage(effects.canvas[id], -x, 0);
    //context.drawImage(effects.canvas[id], -x + effects.canvas[id].width, 0);
    context.globalAlpha = opacity;
    drawScrollingImage(context, effects.canvas[id], -x, 0, z);
    context.globalAlpha = 1;
}

function drawRain(id, context, { drops = 200, color = "rgba(255,255,255,0.5)", vector = { x: 0, y: 8 } }) {

    if (!effects.canvas[id]) {
        effects.canvas[id] = document.createElement('canvas');
        effects.canvas[id].width = context.canvas.width;
        effects.canvas[id].height = context.canvas.height;
    }

    if (effects.redraw) {
        const bgEffectContext = effects.canvas[id].getContext('2d');
        bgEffectContext.clearRect(0, 0, effects.canvas[id].width, effects.canvas[id].height);

        bgEffectContext.beginPath();
        bgEffectContext.lineWidth = 1.5;
        bgEffectContext.strokeStyle = color;

        for (let i = 0; i < drops; i++) {
            const x = Math.random() * effects.canvas[id].width;
            const y = Math.random() * effects.canvas[id].height;
            bgEffectContext.moveTo(x + randoms.nextValue, y + randoms.nextValue);
            bgEffectContext.lineTo(x + vector.x + randoms.nextValue, y + vector.y + randoms.nextValue);
            bgEffectContext.moveTo(x + randoms.nextValue, y + randoms.nextValue);
            bgEffectContext.lineTo(x + vector.x + randoms.nextValue, y + vector.y + randoms.nextValue);

        }
        bgEffectContext.stroke();
    }

    const y = ((Date.now() - sceneStartTime) / 2.5) % effects.canvas[id].height;

    //context.drawImage(bgEffectCanvas, 0, 0);
    drawScrollingImage(context, effects.canvas[id], 0, -y);
}

function drawLightning(context, { x, y, likeliness = 0.015, fork = false }) {

    if (Math.random() > 1 - likeliness) {

        if (!fork) {
            context.strokeStyle = "#ffffff";
            context.lineWidth = 2.5;
            context.beginPath();
        }

        x = x || Math.random() * context.canvas.width;
        y = y || 0;

        while (y < context.canvas.height) {
            context.moveTo(x, y);
            x += Math.random() * 50 - Math.random() * 50;
            y += Math.random() * 50;
            context.lineTo(x, y);

            //if (Math.random() > 0.5) {
            drawLightning(context, { x, y, fork: true });
            //}
        }

        if (!fork) {
            context.stroke();
            context.fillStyle = "rgba(255,255,255,0.1)";
            context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        }
    }
}

function drawTileLayer(layer, context, canvas) {

    if (!tileLayers[layer]) {
        const layerCanvas = document.createElement("canvas");
        tileLayers[layer] = {
            canvas: layerCanvas,
            context: layerCanvas.getContext("2d")
        };
    }

    if (tileLayers.update) {
        if (tileLayers[layer].canvas.width !== canvas.width || tileLayers[layer].canvas.height !== canvas.height) {
            tileLayers[layer].canvas.width = canvas.width;
            tileLayers[layer].canvas.height = canvas.height;
        }
        else {
            tileLayers[layer].context.clearRect(0, 0, tileLayers[layer].canvas.width, tileLayers[layer].canvas.height);
        }

        tileLayers[layer].context.translate(-camera.pixelX, -camera.pixelY);
        drawTiles(layer, tileLayers[layer].context, tileLayers[layer].canvas);
        tileLayers[layer].context.translate(camera.pixelX, camera.pixelY);
    }

    context.drawImage(tileLayers[layer].canvas, 0, 0);
}

function drawSprites(context, canvas) {

    context.setLineDash([]);

    sprites
        .filter(sprite => !sprite.hidden && sprite.x + sprite.width >= camera.x && sprite.y + sprite.height >= camera.y && sprite.x <= camera.x + canvas.width && sprite.y <= camera.y + canvas.height)
        .forEach(sprite => {
            randoms.save();
            drawSprite(sprite, context);

            if (scene.horizontalLoop) {
                if (sprite.x + sprite.width >= scene.right) {
                    context.translate(-scene.width, 0);
                    randoms.restore();
                    drawSprite(sprite, context);
                    context.translate(scene.width, 0);
                }
                else if (sprite.x <= scene.left) {
                    context.translate(scene.width, 0);
                    randoms.restore();
                    drawSprite(sprite, context);
                    context.translate(-scene.width, 0);
                }
            }

            if (scene.verticalLoop) {
                if (sprite.y + sprite.height >= scene.bottom) {
                    context.translate(0, -scene.height);
                    randoms.restore();
                    drawSprite(sprite, context);
                    context.translate(0, scene.height);
                }
                else if (sprite.y <= scene.top) {
                    context.translate(0, scene.height);
                    randoms.restore();
                    drawSprite(sprite, context);
                    context.translate(0, -scene.height);
                }
            }
        });


}

function drawSprite(sprite, context) {

    const type = spriteTypes[sprite.typeId];

    if (!type) {
        throw new Error(`Type ${sprite.typeId} not found`);
    }

    const animationFrame = type.animations[sprite.animation][sprite.frame] || type.animations["idle"][0];

    if (!animationFrame) {
        throw new Error(`Frame ${sprite.frame} not found in animation ${sprite.animation}`);
    }

    const frame = type.frames[animationFrame.frame];

    if (!frame) {
        throw new Error(`Frame ${animationFrame.frame} not found in sprite type ${sprite.typeId}`);
    }

    const rect = {
        x: sprite.x + sprite.width * (animationFrame.x || 0),
        y: sprite.y + sprite.height * (animationFrame.y || 0),
        width: sprite.width * (animationFrame.w || 1),
        height: sprite.height * (animationFrame.h || 1),
    }


    if (sprite.direction === DIRECTION.LEFT) {
        context.save();
        context.translate(rect.x + rect.width, rect.y);
        context.scale(-1, 1);
    }
    else {
        context.translate(rect.x, rect.y);
    }

    frame.forEach(pathData => {
        let path = type.paths[pathData.path];

        if (path) {

            if (pathData.x || pathData.y) {
                context.translate((pathData.x || 0) * sprite.width, (pathData.y || 0) * sprite.width);
            }

            drawPath(path, rect, context);

            if (path.fill) {

                if (sprite.damageCounter > 0 && Math.floor(sprite.damageCounter / 4) % 2 === 0) {
                    context.fillStyle = "#ffffff";
                }
                else if (path.fill === 'sprite') {
                    context.fillStyle = sprite.color;
                }
                else {
                    context.fillStyle = path.fill;
                }
                context.fill();
            }

            if (path.outlineWidth || path.outlineColor) {
                context.setLineDash([]);
                context.lineWidth = path.outlineWidth || 3;
                context.strokeStyle = path.outlineColor || "#303030";
                context.lineCap = "square";
                context.stroke();
                context.lineCap = "butt";
            }

            context.lineWidth = path.lineWidth || 1.5;
            context.strokeStyle = path.stroke || "#404040";
            context.setLineDash(path.lineDash || []);

            if (sprite.damageCounter > 0 && Math.floor(sprite.damageCounter / 4) % 2 === 0) {
                context.strokeStyle = "#ffffff";
            }



            if (path.stroke) {
                context.lineWidth = path.lineWidth || 1.5;
                context.strokeStyle = path.stroke || "#404040";
                context.stroke();
                drawPath(path, rect, context);
                context.stroke();
            }

            if (pathData.x || pathData.y) {
                context.translate((-pathData.x || 0) * sprite.width, (-pathData.y || 0) * sprite.width);
            }
        }
        else {
            throw new Error(`Missing path ${pathData.path} in frame ${animationFrame.frame}`);
        }
    });

    if (sprite.direction === DIRECTION.LEFT) {
        context.restore();
    }
    else {
        context.translate(-rect.x, -rect.y);
    }

    if (type.shaded) {
        context.lineWidth = 1.5;
        context.strokeStyle = "#484848";
        if (type.shape === SHAPES.BOX) {
            if (sprite.height > 10 && sprite.width > 10) {
                context.beginPath();
                context.moveTo(
                    sprite.x + sprite.width - 4 + randoms.nextValue,
                    sprite.y + sprite.height - 8 + randoms.nextValue
                );
                context.lineTo(
                    sprite.x + sprite.width - 8 + randoms.nextValue,// + randoms.x(sprite.x, sprite.y + sprite.height, i),
                    sprite.y + sprite.height - 4 + randoms.nextValue
                );

                context.moveTo(
                    sprite.x + sprite.width - 4 + randoms.nextValue,
                    sprite.y + sprite.height - 12 + randoms.nextValue
                );
                context.lineTo(
                    sprite.x + sprite.width - 6 + randoms.nextValue,// + randoms.x(sprite.x, sprite.y + sprite.height, i),
                    sprite.y + sprite.height - 10 + randoms.nextValue
                );
                context.stroke();

                /*
                if (sprite.height > 8 && sprite.width > 9) {
 
                    context.strokeStyle = "#ffffff";
                    context.beginPath();
                    context.moveTo(
                        sprite.x + 8 + randoms.nextValue,
                        sprite.y + 6 + randoms.nextValue
                    );
                    context.lineTo(
                        sprite.x + 6 + randoms.nextValue,// + randoms.x(sprite.x, sprite.y + sprite.height, i),
                        sprite.y + 8 + randoms.nextValue
                    );
                    context.stroke();
 
                    context.strokeStyle = "#383838";
                }*/
            }
        }
    }
}


function drawPath(path, rect, context) {

    //context.setLineDash([200,2,2,2,2,2]);

    context.beginPath();
    path.commands.forEach(command => {
        switch (command.c) {
            case "mt": context.moveTo(
                rect.width * command.x + randoms.nextValue,
                rect.height * command.y + randoms.nextValue);
                break;
            case "lt": context.lineTo(
                rect.width * command.x + randoms.nextValue,
                rect.height * command.y + randoms.nextValue);
                break;
            case "rc": context.moveTo(
                rect.width * command.l + randoms.nextValue,
                rect.height * command.t + randoms.nextValue);
                context.lineTo(
                    rect.width * command.r + randoms.nextValue,
                    rect.height * command.t + randoms.nextValue);
                context.lineTo(
                    rect.width * command.r + randoms.nextValue,
                    rect.height * command.b + randoms.nextValue);
                context.lineTo(
                    rect.width * command.l + randoms.nextValue,
                    rect.height * command.b + randoms.nextValue);
                context.closePath();
                break;
            case "ar": context.arc(
                rect.width * command.x + randoms.nextValue,
                rect.height * command.y + randoms.nextValue,
                Math.max(1, rect.width / 2 * command.r + randoms.nextValue / 2),
                (Math.PI * 2) * (command.sa || 0),
                (Math.PI * 2) * (command.ea || 1));
                break;
            case "el": context.ellipse(
                rect.width * command.x + randoms.nextValue,
                rect.height * command.y + randoms.nextValue,
                Math.max(1, rect.width / 2 * command.rx + randoms.nextValue / 2),
                Math.max(1, rect.width / 2 * command.ry + randoms.nextValue / 2),
                command.ra || 0,
                Math.PI * 2 * (command.sa || 0),
                Math.PI * 2 * (command.ea || 1));
                break;
            case "qc": context.quadraticCurveTo(
                rect.width * command.cpx + randoms.nextValue * 2,
                rect.height * command.cpy + randoms.nextValue * 2,
                rect.width * command.x + randoms.nextValue,
                rect.height * command.y + randoms.nextValue);
                break;
            case "cp": context.closePath(); break;
            case "bp": context.beginPath(); break;
            case "fill": context.fill(); break;
            case "stroke": context.stroke(); break;
        }
    });
}

function drawTiles(layer, context, canvas) {

    context.lineWidth = 1.5;
    context.lineCap = "butt";
    context.setLineDash([]);

    const zx = typeof editor !== "undefined" ? 0 : camera.pixelX;
    const zy = typeof editor !== "undefined" ? 0 : camera.pixelY;

    scene.tiles
        .filter(tile =>
            tile.layer === layer
            && tile.x + tile.width >= camera.pixelX + zx * tile.z
            && tile.y + tile.height >= camera.pixelY + zy * tile.z
            && tile.x <= camera.pixelX + zx * tile.z + canvas.width
            && tile.y <= camera.pixelY + zy * tile.z + canvas.height)
        .forEach(tile => {
            if (tileCanvases[tile.id]) {
                let canvas = tileCanvases[tile.id].canvas;
                context.translate(zx * -tile.z, zy * -tile.z);
                context.translate(tile.x - 2, tile.y - 2);
                context.drawImage(canvas, 0, 0);
                context.translate(-(tile.x - 2), -(tile.y - 2));
                context.translate(zx * tile.z, zy * tile.z);
            }
        });
}

function drawTile(tile, context) {

    context.lineWidth = 1.5;
    context.strokeStyle = tile.stroke;
    context.fillStyle = tile.color;
    context.globalAlpha = tile.opacity;
    context.setLineDash([200, 2, 2, 2, 290, 2, 2, 2, 2, 2]);

    if (tile.shape === SHAPES.BOX) {

        if (tile.transparent === false) {
            context.fillRect(0, 0, tile.width, tile.height);
        }

        for (let i = 0; i < 2; i++) {
            context.beginPath();

            if (tile.borders.t) {
                context.moveTo(
                    randoms.x(tile.x, tile.y, i),
                    randoms.y(tile.x, tile.y, i)
                );


                context.lineTo(
                    tile.width + randoms.x(tile.x + tile.width, tile.y, i),
                    randoms.y(tile.x + tile.width, tile.y, i)
                );
            }

            if (tile.borders.r) {
                context.moveTo(
                    tile.width + randoms.x(tile.x + tile.width, tile.y, i),
                    randoms.y(tile.x + tile.width, tile.y, i)
                );

                context.lineTo(
                    tile.width + randoms.x(tile.x + tile.width, tile.y + tile.height, i),
                    tile.height + randoms.y(tile.x + tile.width, tile.y + tile.height, i)
                );
            }

            if (tile.borders.b) {
                context.moveTo(
                    tile.width + randoms.x(tile.x + tile.width, tile.y + tile.height, i),
                    tile.height + randoms.y(tile.x + tile.width, tile.y + tile.height, i)
                );

                context.lineTo(
                    randoms.x(tile.x, tile.y + tile.height, i),
                    tile.height + randoms.y(tile.x, tile.y + tile.height, i)
                );
            }

            if (tile.borders.l) {
                context.moveTo(
                    randoms.x(tile.x, tile.y + tile.height, i),
                    tile.height + randoms.y(tile.x, tile.y + tile.height, i)
                );

                context.lineTo(
                    randoms.x(tile.x, tile.y, i),
                    randoms.y(tile.x, tile.y, i)
                );
            }
            context.stroke();
        }

        if (tile.borders.b && tile.borders.r) {

            if (tile.height > 10 && tile.width > 10) {
                context.beginPath();
                context.moveTo(
                    tile.width - 4 + randoms.nextValue,
                    tile.height - 8 + randoms.nextValue
                );
                context.lineTo(
                    tile.width - 8 + randoms.nextValue,// + randoms.x(tile.x, tile.y + tile.height, i),
                    tile.height - 4 + randoms.nextValue
                );
                context.moveTo(
                    tile.width - 4 + randoms.nextValue,
                    tile.height - 12 + randoms.nextValue
                );
                context.lineTo(
                    tile.width - 6 + randoms.nextValue,// + randoms.x(tile.x, tile.y + tile.height, i),
                    tile.height - 10 + randoms.nextValue
                );
                context.stroke();
            }
        }
        if (tile.layer !== LAYERS.BACKGROUND && tile.borders.t && tile.borders.l) {

            if (tile.height > 8 && tile.width > 9) {

                context.strokeStyle = "#ffffff";
                context.beginPath();
                context.moveTo(
                    6 + randoms.nextValue,
                    4 + randoms.nextValue
                );
                context.lineTo(
                    4 + randoms.nextValue,// + randoms.x(tile.x, tile.y + tile.height, i),
                    6 + randoms.nextValue
                );

                context.stroke();
            }
        }

        if (tile.materialId === tileMaterials.ice.id && tile.height > 24) {

            context.fillStyle = "rgba(255,255,255,0.7)";
            //context.strokeStyle = "rgba(255,255,255,0.9)";
            //context.lineWidth = 4;

            context.beginPath();
            context.moveTo(
                4 + randoms.nextValue,
                4 + randoms.nextValue
            );
            context.lineTo(
                tile.width - 4 + randoms.nextValue,
                4 + randoms.nextValue
            );
            context.lineTo(
                tile.width - 4 + randoms.nextValue,
                16 + randoms.nextValue
            );
            context.quadraticCurveTo(
                tile.width * 0.5,
                4,
                4 + randoms.nextValue,
                24 + randoms.nextValue

            );
            context.closePath();
            context.fill();
            //context.stroke();


            context.beginPath();
            context.moveTo(
                4 + randoms.nextValue,
                tile.height - 4 + randoms.nextValue
            );
            context.lineTo(
                tile.width - 4 + randoms.nextValue,
                tile.height - 4 + randoms.nextValue
            );
            context.lineTo(
                tile.width - 4 + randoms.nextValue,
                tile.height - 16 + randoms.nextValue
            );
            context.quadraticCurveTo(
                tile.width * 0.5,
                tile.height - 4,
                4 + randoms.nextValue,
                tile.height - 9 + randoms.nextValue
            );
            context.closePath();
            context.fill();
            //context.stroke();
            /*
            context.fillStyle = "rgba(255,255,255,0.6)";
            context.beginPath();
            context.moveTo(
                4 + randoms.nextValue,
                4 + randoms.nextValue
            );
            context.lineTo(
                24 + randoms.nextValue,
                4 + randoms.nextValue
            ); 
            context.lineTo(
                4 + randoms.nextValue,
                24 + randoms.nextValue
            );     
            context.closePath();
            context.fill();        
            
            context.beginPath();
            context.moveTo(
                tile.width * 0.5 + 32 + randoms.nextValue,
                4 + randoms.nextValue
            );
            context.lineTo(
                tile.width * 0.5 - 32 + randoms.nextValue,
                tile.height - 4 + randoms.nextValue
            ); 
            context.lineTo(
                tile.width * 0.5 - 48 + randoms.nextValue,
                tile.height - 4 + randoms.nextValue
            ); 
            context.lineTo(
                tile.width * 0.5 + 16 + randoms.nextValue,
                4 + randoms.nextValue
            );     
            context.closePath();
            context.fill();
            

            context.beginPath();
            context.moveTo(
                tile.width - 4 + randoms.nextValue,
                tile.height - 4 + randoms.nextValue
            );
            context.lineTo(
                tile.width - 4 + randoms.nextValue,
                tile.height - 24 + randoms.nextValue
            ); 
            context.lineTo(
                tile.width - 24 + randoms.nextValue,
                tile.height - 4 + randoms.nextValue
            );     
            context.closePath();
            context.fill(); 
            */
        }
    }
    else if (tile.shape === SHAPES.SLOPE_LEFT) {
        if (tile.transparent === false) {
            context.beginPath();
            context.moveTo(tile.width, 0);
            context.lineTo(tile.width, tile.height);
            context.lineTo(0, tile.height);
            context.closePath();
            context.fill();
        }

        if (tile.borders.t) {
            for (let i = 0; i < 2; i++) {
                context.beginPath();
                context.moveTo(
                    tile.width + randoms.x(tile.x + tile.width, tile.y, i),
                    randoms.y(tile.x + tile.width, tile.y, i)
                );
                context.lineTo(
                    randoms.x(tile.x, tile.y + tile.height, i),
                    tile.height + randoms.y(tile.x, tile.y + tile.height, i)
                );
                context.stroke();
            }
        }
    }
    else if (tile.shape === SHAPES.SLOPE_RIGHT) {
        if (tile.transparent === false) {
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(tile.width, tile.height);
            context.lineTo(0, tile.height);
            context.closePath();
            context.fill();
        }

        if (tile.borders.t) {
            for (let i = 0; i < 2; i++) {
                context.beginPath();
                context.moveTo(
                    randoms.x(tile.x, tile.y, i),
                    randoms.y(tile.x, tile.y, i)
                );
                context.lineTo(
                    tile.width + randoms.x(tile.x + tile.width, tile.y + tile.height, i),
                    tile.height + randoms.y(tile.x + tile.width, tile.y + tile.height, i)
                );
                context.stroke();
            }
        }
    }
    else if (tile.shape === SHAPES.SLOPING_CEILING_LEFT) {
        if (tile.transparent === false) {
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(tile.width, 0);
            context.lineTo(tile.width, tile.height);
            context.closePath();
            context.fill();
        }

        if (tile.borders.t) {
            for (let i = 0; i < 2; i++) {
                context.beginPath();
                context.moveTo(
                    randoms.x(tile.x, tile.y, i),
                    randoms.y(tile.x, tile.y, i)
                );
                context.lineTo(
                    tile.width + randoms.x(tile.x + tile.width, tile.y + tile.height, i),
                    tile.height + randoms.y(tile.x + tile.width, tile.y + tile.height, i)
                );
                context.stroke();
            }
        }
    }
    else if (tile.shape === SHAPES.SLOPING_CEILING_RIGHT) {
        if (tile.transparent === false) {
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(tile.width, 0);
            context.lineTo(0, tile.height);
            context.closePath();
            context.fill();
        }

        if (tile.borders.t) {
            for (let i = 0; i < 2; i++) {
                context.beginPath();
                context.moveTo(
                    tile.width + randoms.x(tile.x + tile.width, tile.y, i),
                    randoms.y(tile.x + tile.width, tile.y, i)
                );
                context.lineTo(
                    randoms.x(tile.x, tile.y + tile.height, i),
                    tile.height + randoms.y(tile.x, tile.y + tile.height, i)
                );
                context.stroke();
            }
        }
    }
    else if (tile.shape === SHAPES.TOP_DOWN) {
        //context.fillRect(tile.x, tile.y, tile.width, tile.height);
        context.beginPath();
        context.moveTo(
            randoms.x(tile.x, tile.y),
            randoms.y(tile.x, tile.y)
        );
        context.lineTo(
            tile.width + randoms.x(tile.x + tile.width, tile.y),
            randoms.y(tile.x + tile.width, tile.y),
        );
        context.lineTo(
            tile.width + randoms.x(tile.x + tile.width, tile.y + tile.height),
            tile.height + randoms.y(tile.x + tile.width, tile.y + tile.height),
        );
        context.lineTo(
            randoms.x(tile.x, tile.y + tile.height),
            tile.height + randoms.y(tile.x, tile.y + tile.height)
        );
        context.closePath();
        if (tile.transparent === false) {
            context.fill();
        }
        context.setLineDash([24, 4]);
        context.stroke();
        context.setLineDash([]);

        context.beginPath();
        for (let i = 0; i < 2; i++) {

            context.moveTo(
                randoms.x(tile.x, tile.y, i),
                8 + randoms.y(tile.x, tile.y + 8, i)
            );
            context.lineTo(
                randoms.x(tile.x, tile.y, i),
                randoms.y(tile.x, tile.y, i)
            );

            context.lineTo(
                tile.width + randoms.x(tile.x + tile.width, tile.y, i),
                randoms.y(tile.x + tile.width, tile.y, i)
            );
            context.lineTo(
                tile.width + randoms.x(tile.x + tile.width, tile.y, i),
                8 + randoms.y(tile.x + 8 + tile.width, tile.y, i)
            );
        }
        context.stroke();
    }
}

function drawParticles(context, canvas) {

    context.lineWidth = 3.5;
    context.setLineDash([]);

    const visibleParticles = particles
        .filter(particle =>
            particle.x + particle.width >= camera.pixelX
            && particle.y + particle.height >= camera.pixelY
            && particle.x <= camera.pixelX + canvas.width
            && particle.y <= camera.pixelY + canvas.height);


    visibleParticles.forEach(particle => {
        context.translate(particle.x, particle.y);
        particle.type.draw(particle, context, false, true);
        context.translate(-particle.x, -particle.y);
    });

    visibleParticles.forEach(particle => {
        context.translate(particle.x, particle.y);

        particle.type.draw(particle, context, true, false);
        context.translate(-particle.x, -particle.y);
    });
}

/*
function drawParticle(particle, context) {

    const animationFrame = particle.type.animations[particle.animation][particle.frame];
    const frame = particle.type.frames[animationFrame.frame];

    const rect = {
        x: particle.x + particle.width * (animationFrame.x || 0),
        y: particle.y + particle.height * (animationFrame.y || 0),
        width: particle.width * (animationFrame.w || 1),
        height: particle.height * (animationFrame.h || 1),
    };

    context.translate(rect.x, rect.y);

    frame.forEach(pathData => {
        let path = type.paths[pathData.path];
        context.lineWidth = path.lineWidth || 1.5;
        context.strokeStyle = path.stroke || "#404040";
        context.setLineDash(path.lineDash || []);

        if (pathData.x || pathData.y) {
            context.translate((pathData.x || 0) * particle.width, (pathData.y || 0) * particle.width);
        }

        drawPath(path, rect, context);

        if (path.fill) {
            context.fillStyle = path.fill;
            context.fill();
        }
        if (path.stroke) {
            context.stroke();
            drawPath(path, rect, context);
            context.stroke();
        }

        if (pathData.x || pathData.y) {
            context.translate((-pathData.x || 0) * particle.width, (-pathData.y || 0) * particle.width);
        }
    });

    context.translate(-rect.x, -rect.y);
}*/


function drawText(text, y, fillStyle, strokeStyle) {
    context.font = FONT;
    context.setLineDash([]);
    context.lineWidth = 5;
    context.strokeStyle = "#404040";
    context.fillStyle = "#ffffff";
    const textWidth = context.measureText(text).width;
    context.strokeText(text, canvas.clientWidth / 2 - textWidth / 2, canvas.clientHeight / 2);
    //context.strokeText(text, SCREEN_WIDTH / 2 - textWidth / 2 + randoms.nextValue, SCREEN_HEIGHT / 2 + randoms.nextValue);
    context.fillText(text, canvas.clientWidth / 2 - textWidth / 2, canvas.clientHeight / 2);
}

function drawCaptions() {
    if (scene.captions.length > 0 && showCaptions) {
        const now = Date.now();
        scene.captions
            .filter(caption => !caption.delay || caption.delay < now - gameState.stateStartTime)
            .forEach(caption => {
                drawCaption(caption);
            });
    }

    if (isPlayerReady) {
        if (mode.pause) {
            drawCaption({ text: "PAUSED", y: 0.5 });
        }
        else if (state.failed === true && Date.now() - (sceneStartTime + sceneFailedTime) < 2000) {
            drawCaption({ text: `Oh, ${Date.now() - (sceneStartTime + sceneFailedTime) > 1700 ? 'F' : 'D'}uck`, y: 0.5 });
        }
        else if (state.completed === true) {
            //drawCaption({ text: scene.endCaption, y: 0.1 });
            drawTitle({ text: scene.endCaption, fillStyle: "#ffc080", shadow: true, fontSize: 70, y: 0.2, lineWidth: 2.5 });

        }
        if (sceneCompletionTime !== -1) {
            drawCaption({ text: "Time: " + Math.round((sceneCompletionTime) / 10) / 100 + " seconds", y: 0.8 });

            if (sceneBestTime === undefined) {
                drawCaption({ text: "Nice, but surely you can be faster?", y: 0.9 });
            }
            else if (sceneCompletionTime < sceneBestTime) {
                drawCaption({ text: `New speed record! You were ${Math.round((sceneBestTime - sceneCompletionTime) / 10) / 100} seconds faster.`, y: 0.9 });
            }
            else {
                drawCaption({ text: "Your best time: " + Math.round((sceneBestTime) / 10) / 100 + " seconds", y: 0.9 });
            }
        }
    }
    else {
        if (sceneBestTime) {
            drawCaption({ text: "Best time: " + Math.round((sceneBestTime) / 10) / 100 + " seconds", y: 0.025, fillStyle: "#fff0d0" });
        }
    }
}

function drawCaption({ text, x = 0.5, y = 0.2, fontSize = 30, showBox = true, fillStyle = "#ffffff" }) {
    context.setLineDash([]);
    context.lineWidth = 2;
    context.font = `${fontSize}px ${FONT_FAMILY}`;
    context.strokeStyle = "#404040";

    const textWidth = context.measureText(text).width;

    const left = canvas.width * x - textWidth / 2;
    const top = canvas.height * y;
    const right = left + textWidth;
    const bottom = top + fontSize;


    if (showBox) {
        const padding = 12;
        context.fillStyle = fillStyle;
        context.beginPath();
        context.moveTo(left - padding + randoms.nextValue, top + randoms.nextValue);
        context.lineTo(right + padding + randoms.nextValue, top + randoms.nextValue);
        context.lineTo(right + padding + randoms.nextValue, bottom + padding + randoms.nextValue);
        context.lineTo(left - padding + randoms.nextValue, bottom + padding + randoms.nextValue);
        context.closePath();
        context.stroke();
        context.fill();
        context.beginPath();
        context.moveTo(left - padding + randoms.nextValue, top + randoms.nextValue);
        context.lineTo(right + padding + randoms.nextValue, top + randoms.nextValue);
        context.lineTo(right + padding + randoms.nextValue, bottom + padding + randoms.nextValue);
        context.lineTo(left - padding + randoms.nextValue, bottom + padding + randoms.nextValue);
        context.closePath();
        context.stroke();
    }

    context.fillStyle = "#303030";

    context.fillText(text, left, bottom);
}

function drawEnd() {

    context.fillStyle = "#383838";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = "#686868";
    context.setLineDash([32, (canvas.width - 128), 64, (canvas.height - 128), 64, (canvas.width - 128), 64, (canvas.height - 128)]);
    context.lineWidth = 4.5;
    context.strokeRect(32, 32, canvas.width - 64, canvas.height - 64);
    context.setLineDash([]);
    context.lineWidth = 1.5;
    context.strokeRect(32, 32, canvas.width - 64, canvas.height - 64);


    drawTitle({ text: "You have reached the end of", fontSize: 40, fillStyle: "#ffffff", y: 0.2 });
    //drawTitle({ text: "Duckface", fontSize: 50, fillStyle: "#ffc080", y: 0.3 });

    drawTitle({ text: album.title, fontSize: 40, fillStyle: "#ffc080", y: 0.35 });
    const bestTimes = JSON.parse(localStorage.getItem("duckface-best-times") || "{}");
    let completedScenes = 0;
    let albumTime = 0;
    album.scenes.forEach(scene => {
        scene.bestTime = -1;
        for (let time in bestTimes) {
            if (time.startsWith(`${album.id}-${scene.id}`)) {
                scene.bestTime = bestTimes[time];
            }
        }
        if (scene.bestTime !== -1) {
            completedScenes++;
            albumTime += scene.bestTime;
        }
    });

    drawTitle({ text: `Levels completed: ${completedScenes} / ${album.scenes.length}`, fontSize: 30, fillStyle: "#ffffff", y: 0.50 });
    drawTitle({ text: `Best times total: ${Math.round((albumTime) / 10) / 100} seconds`, fontSize: 30, fillStyle: "#ffffff", y: 0.60 });


    if (completedScenes < album.scenes.length) {
        drawTitle({ text: `Good job. Now, go and finish the rest of the levels, you cheat!`, fontSize: 20, fillStyle: "#ffffff", y: 0.80 });
    }
    else {
        drawTitle({ text: `Well done! You are the winner of everything!`, fontSize: 20, fillStyle: "#ffffff", y: 0.80 });
    }

}

function drawEditorStuff() {

    canvas.style.cursor = "crosshair";

    context.save();

    context.translate(-camera.pixelX, -camera.pixelY);

    context.globalCompositeOperation = "difference";

    // cursor text

    context.font = `10px Arial`;
    context.fillStyle = "#ffffff";
    context.fillText(`${controls.mouseX}, ${controls.mouseY}`, controls.mouseX + 8, controls.mouseY + 16);

    if (editor.showSpriteIds) {
        context.font = "10px Arial";
        context.fillStyle = "#000000";
        sprites.forEach(sprite => {
            context.fillText(sprite.id + " " + sprite.velocity.y, sprite.x, sprite.y - 8);
        });
    }

    if (editor.showTileIds) {
        context.font = "10px Arial";
        context.fillStyle = "#000000";
        scene.tiles.forEach(tile => {
            context.fillText(tile.id, tile.x, tile.y - 8);
        });
    }

    // cursor style

    scene.tiles.forEach(tile => {
        if (controls.mouseX >= tile.x && controls.mouseX <= tile.x + tile.width
            && controls.mouseY >= tile.y && controls.mouseY <= tile.y + tile.height) {
            canvas.style.cursor = "pointer";
        }
    });

    sprites.forEach(sprite => {
        if (controls.mouseX >= sprite.x && controls.mouseX <= sprite.x + sprite.width
            && controls.mouseY >= sprite.y && controls.mouseY <= sprite.y + sprite.height) {
            canvas.style.cursor = "pointer";
        }
    });

    // tiles

    scene.tiles
        .filter(tile => editor.idsOfSelectedTiles.includes(tile.id))
        .forEach(tile => {

            context.setLineDash([6, 3]);
            context.lineWidth = 2;
            context.strokeStyle = "#ffffff";
            context.globalCompositeOperation = "difference";

            //context.strokeRect(tile.x, tile.y, tile.width, tile.height);

            context.setLineDash([]);
            context.lineWidth = 2;

            if (editor.dragMode === "MOVE") {
                context.strokeRect(
                    tile.x + controls.endMouseX - controls.startMouseX,
                    tile.y + controls.endMouseY - controls.startMouseY,
                    tile.width, tile.height);
                canvas.style.cursor = "grabbing";
            }
            else if (editor.dragMode !== "RESIZE") {
                drawResizeHandles({ context, rect: tile });
            }
            else if (editor.dragMode === "RESIZE") {
                drawResizePreview({ context, rect: tile });
            }
        });

    // sprites

    editor.idsOfSelectedSprites.forEach(id => {
        let sprite = sprites.find(sprite => sprite.id === id);
        // sprite can be removed in game (e.g. collected by player)
        if (sprite) {
            let spriteOrigin = scene.sprites.find(sprite => sprite.id === id);
            let type = spriteTypes[sprite.typeId];

            context.setLineDash([6, 3]);
            context.lineWidth = 2;
            context.strokeStyle = "#ffffff";
            context.globalCompositeOperation = "difference";

            if (type.shape === SHAPES.BOX) {
                context.strokeRect(Math.floor(sprite.x), Math.floor(sprite.y), sprite.width, sprite.height);
                context.strokeRect(spriteOrigin.x, spriteOrigin.y, spriteOrigin.width, spriteOrigin.height);

                context.beginPath();
                context.moveTo(spriteOrigin.x + spriteOrigin.width / 2, spriteOrigin.y + spriteOrigin.height / 2);
                context.lineTo(sprite.x + sprite.width / 2, sprite.y + sprite.height / 2);
                context.stroke();
            }
            else if (type.shape === SHAPES.CIRCLE) {
                context.beginPath();
                context.arc(sprite.x + sprite.width / 2, sprite.y + sprite.height / 2, sprite.width / 2, 0, Math.PI * 2);
                context.closePath();
                context.stroke();
            }

            context.setLineDash([]);
            context.lineWidth = 1;

            if (editor.dragMode === "MOVE") {
                context.strokeRect(
                    spriteOrigin.x + controls.endMouseX - controls.startMouseX,
                    spriteOrigin.y + controls.endMouseY - controls.startMouseY,
                    spriteOrigin.width, spriteOrigin.height);
                canvas.style.cursor = "grabbing";
            }
            else if (editor.dragMode !== "RESIZE") {
                drawResizeHandles({ context, rect: spriteOrigin, resizable: type.resizable });
                drawResizeHandles({ context, rect: sprite, resizable: type.resizable });
            }
            else if (editor.dragMode === "RESIZE") {
                drawResizePreview({ context, rect: sprite });
                drawResizePreview({ context, rect: spriteOrigin });
            }
        }
    });

    if (controls.mouseLeft && editor.dragMode === "DRAW") {

        context.setLineDash([6, 3]);
        context.lineWidth = 1.5;
        context.strokeStyle = "#ffffff";
        context.globalCompositeOperation = "difference";

        context.strokeRect(
            Math.min(controls.startMouseX, controls.endMouseX),// + 1.5,
            Math.min(controls.startMouseY, controls.endMouseY),// + 1.5,
            Math.max(controls.startMouseX, controls.endMouseX) - Math.min(controls.startMouseX, controls.endMouseX),
            Math.max(controls.startMouseY, controls.endMouseY) - Math.min(controls.startMouseY, controls.endMouseY)
        );
        context.setLineDash([]);

        context.fillText(
            `${Math.abs(controls.startMouseX - controls.endMouseX)}`,
            (controls.startMouseX + controls.endMouseX) / 2,
            Math.min(controls.startMouseY, controls.endMouseY) - 8
        );
        context.fillText(
            `${Math.abs(controls.startMouseY - controls.endMouseY)}`,
            Math.max(controls.endMouseX, controls.startMouseX) + 8,
            (controls.startMouseY + controls.endMouseY) / 2
        );
    }

    // scene border

    context.lineWidth = 1;
    context.strokeStyle = "#ffffff";
    context.globalCompositeOperation = "difference";
    context.setLineDash([editor.grid.width, editor.grid.width]);
    context.strokeRect(scene.left, scene.top, scene.width, scene.height);

    context.setLineDash([]);
    if (editor.idsOfSelectedTiles.length === 0 && editor.idsOfSelectedSprites.length === 0) {
        if (editor.dragMode !== "RESIZE") {
            drawResizeHandles({
                context,
                rect: {
                    x: scene.left,
                    y: scene.top,
                    width: scene.right - scene.left,
                    height: scene.bottom - scene.top
                }
            });
        }
        else if (editor.dragMode === "RESIZE") {
            drawResizePreview({
                context,
                rect: {
                    x: scene.left,
                    y: scene.top,
                    width: scene.right - scene.left,
                    height: scene.bottom - scene.top
                }
            });
        }
    }

    context.restore();

    //context.translate(Math.floor(camera.x), Math.floor(camera.y));

    context.globalCompositeOperation = "difference";

    // grid
    context.strokeStyle = "#ffffff";

    /*
    for (let x = 0; x < canvas.width; x += editor.grid.width) {
        for (let y = 0; y < canvas.height; y += editor.grid.height) {
            context.fillRect(x + 0.5, y + 0.5, 0.5, 0.5);
        }
    }*/

    // cursor



    context.setLineDash([10, 4]);
    context.lineWidth = 2;
    context.strokeStyle = "#ffffff";

    context.beginPath();
    context.moveTo(controls.mouseX - camera.pixelX, 0);
    context.lineTo(controls.mouseX - camera.pixelX, canvas.height);
    context.moveTo(0, controls.mouseY - camera.pixelY);
    context.lineTo(canvas.width, controls.mouseY - camera.pixelY);
    context.stroke();

    context.globalCompositeOperation = "source-over";

    if (mode.pause) {
        drawCaption({ text: "SCROLL MODE (P)", y: 0.01 });
    }
    else {
        drawCaption({ text: "GAME MODE (P)", y: 0.01 });
    }

    if (state.completed) {
        drawCaption({ text: "Level complete (Reset game)", y: 0.9 });
    }
    else if (state.failed) {
        drawCaption({ text: "Game Over (Reset game)", y: 0.9 });
    }

}

function drawResizePreview({ context, rect }) {
    context.fillStyle = "#ffffff";
    context.strokeStyle = "#000000";
    context.globalCompositeOperation = "source-over";

    const dragArea = {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
    };

    if (editor.resizeDirections.includes(DIRECTION.LEFT)) {
        dragArea.x += controls.endMouseX - controls.startMouseX;
        dragArea.width += controls.startMouseX - controls.endMouseX;
    }

    if (editor.resizeDirections.includes(DIRECTION.RIGHT)) {
        dragArea.width += controls.endMouseX - controls.startMouseX;
    }

    if (editor.resizeDirections.includes(DIRECTION.TOP)) {
        dragArea.y += controls.endMouseY - controls.startMouseY;
        dragArea.height += controls.startMouseY - controls.endMouseY;
    }

    if (editor.resizeDirections.includes(DIRECTION.BOTTOM)) {
        dragArea.height += controls.endMouseY - controls.startMouseY
    }

    context.strokeRect(dragArea.x, dragArea.y, dragArea.width, dragArea.height);
}

function drawResizeHandles({ context, rect, resizable = true }) {
    context.fillStyle = "#ffffff";
    context.strokeStyle = "#000000";
    context.globalCompositeOperation = "source-over";

    if (controls.mousePixelX >= rect.x && controls.mousePixelX <= rect.x + rect.width
        && controls.mousePixelY >= rect.y && controls.mousePixelY <= rect.y + rect.height) {
        canvas.style.cursor = "grab";
    }

    //const radius = rect.width <= 16 || rect.height <= 16 ? 4 : 14;
    const radius = Math.max(4, Math.min(14, Math.min(rect.width, rect.height) / 3));

    if (resizable) {
        drawResizeHandle({ context, x: rect.x, y: rect.y, radius, cursor: "nwse-resize", resizeDirections: [DIRECTION.TOP, DIRECTION.LEFT] });
        drawResizeHandle({ context, x: rect.x + rect.width / 2, y: rect.y, radius, cursor: "row-resize", resizeDirections: [DIRECTION.TOP] });
        drawResizeHandle({ context, x: rect.x + rect.width, y: rect.y, radius, cursor: "nesw-resize", resizeDirections: [DIRECTION.TOP, DIRECTION.RIGHT] });

        drawResizeHandle({ context, x: rect.x, y: rect.y + rect.height / 2, radius, cursor: "col-resize", resizeDirections: [DIRECTION.LEFT] });
        drawResizeHandle({ context, x: rect.x + rect.width, y: rect.y + rect.height / 2, radius, cursor: "col-resize", resizeDirections: [DIRECTION.RIGHT] });

        drawResizeHandle({ context, x: rect.x, y: rect.y + rect.height, radius, cursor: "nesw-resize", resizeDirections: [DIRECTION.BOTTOM, DIRECTION.LEFT] });
        drawResizeHandle({ context, x: rect.x + rect.width / 2, y: rect.y + rect.height, radius, cursor: "row-resize", resizeDirections: [DIRECTION.BOTTOM] });
        drawResizeHandle({ context, x: rect.x + rect.width, y: rect.y + rect.height, radius, cursor: "nwse-resize", resizeDirections: [DIRECTION.BOTTOM, DIRECTION.RIGHT] });
    }

    if (!editor.dragHandle && controls.mouseLeft &&
        controls.mousePixelX >= rect.x && controls.mousePixelX <= rect.x + rect.width
        && controls.mousePixelY >= rect.y && controls.mousePixelY <= rect.y + rect.height) {
        editor.startMove();
    }
}

function drawResizeHandle({ context, x, y, cursor, radius = 14, resizeDirections }) {

    context.fillStyle = "#ffffff";
    context.strokeStyle = "#000000";

    if (!editor.dragHandle &&
        controls.mousePixelX >= x - radius / 2 &&
        controls.mousePixelX <= x + radius / 2 &&
        controls.mousePixelY >= y - radius / 2 &&
        controls.mousePixelY <= y + radius / 2) {
        context.canvas.style.cursor = cursor;
        context.fillStyle = "#80ff80";
        if (controls.mouseLeft) {
            editor.startResize({ resizeDirections });
        }
    }

    if (editor.dragHandle) {
        return;
    }

    context.beginPath();
    context.arc(x, y, radius / 2, 0, Math.PI * 2);
    context.stroke();
    context.fill();
}

function drawSpriteInfo(context) {

    sprites.forEach(sprite => {
        //if (sprite.collision) {

        context.strokeStyle = "#ffffff";
        context.lineWidth = 2;

        sprite.collisionData.boxes.forEach(box => {
            context.strokeRect(
                box.l,
                box.t,
                box.r - box.l,
                box.b - box.t
            );
        });

        if (sprite.collisionArea) {
            context.strokeStyle = "#ff0000";
            context.lineWidth = 4;

            context.strokeRect(
                sprite.collisionArea.left - 1,
                sprite.collisionArea.top - 1,
                sprite.collisionArea.width + 1,
                sprite.collisionArea.height + 1
            );
        }

        context.fillStyle = "#ffffff";
        context.font = `10px Arial`;
        context.fillText(`${sprite.id}`, sprite.x, sprite.y - 35);
        context.fillText(`x = ${sprite.x}`, sprite.x, sprite.y - 20);
        context.fillText(`y = ${sprite.y}`, sprite.x, sprite.y - 10);
        context.fillText(`vx = ${sprite.velocity.x}`, sprite.x, sprite.y + sprite.height + 15);
        context.fillText(`vy = ${sprite.velocity.y}`, sprite.x, sprite.y + sprite.height + 25);

        //}
    });
}