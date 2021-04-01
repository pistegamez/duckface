'use strict';

//const SCREEN_WIDTH = 800;
//const SCREEN_HEIGHT = 600;
const FONT_FAMILY = "Gaegu";
const FONT_SIZE_PX = 80;
const FONT = `${FONT_SIZE_PX}px ${FONT_FAMILY}`;

window.onerror = (message, source, lineno, colno, error) => {
    alert(`message: ${message} source: ${source} line: ${lineno}`);
};

let debugMode = true;

let album = null;

let sprites = [];
let state = {};
let mode = {};
let particles = [];

let isPlayerReady = false;

let showCaptions = true;
let sceneLoadedTime = Date.now();
let sceneStartTime = -1;
let sceneCompletionTime = -1;
let sceneFailedTime = -1;
let sceneBestTime = undefined;

let jitters = true;
let grain = true;

let canvas;
let context;

let scene = new Scene({
    tiles: [],
    sprites: []
});

const STATES = {
    START: 1,
    TITLE: 2,
    PLAY: 3,
    END: 4,
};

const gameState = {
    state: STATES.PLAY,
    stateStartTime: -1,
    init(state = STATES.PLAY) {
        this.fadeCanvas = document.createElement("canvas");
        this.fadeContext = this.fadeCanvas.getContext("2d");
        this.setState(state);
    },
    setState(state) {
        if (state !== this.state) {
            this.state = state;
            this.resetCurrentState();
        }
    },
    resetCurrentState() {
        this.fadeCanvas.width = canvas.width;
        this.fadeCanvas.height = canvas.height;
        this.fadeContext.drawImage(canvas, 0, 0);
        this.stateStartTime = Date.now();
    }
}

const camera = new Camera({
    enabled: true,
    x: 0,
    y: 0,
    pixelX: 0,
    pixelY: 0,
});

const randoms = new RandomValues(50, 1.25);

setInterval(() => {
    if (jitters) {
        randoms.recalculate();
        updateTileCanvases();
        tileLayers.update = true;
    }
}, 200);

let dataFromWorker = null;

//const worker = new Worker('/js/worker.js');

worker.onmessage = ({ data }) => {
    if (data.type === "STATUS") {
        dataFromWorker = data;
    }

    if (data.type === "PLAY_SOUND") {
        audio.playSound(data);
    }

    if (data.type === "EMIT_PARTICLES") {
        emitParticles(data);
    }
}

const controls = {
    up: false,
    right: false,
    down: false,
    left: false,
    mouseLeft: false,
    mouseRight: false,
    startMouseX: 0,
    startMouseY: 0,
    endMouseX: 0,
    endMouseY: 0,
    touchX: 0,
    touchY: 0,
    rightTouch: false,
    leftTouch: false,
    doubleTouch: true
}

const onGameKeydownListener = event => {

    if (gameState.state === STATES.PLAY) {
        if (event.code === 'ArrowLeft' || event.key === 'a') {
            worker.postMessage({ action: "START_CONTROL_LEFT" });
        }
        if (event.code === 'ArrowRight' || event.key === 'd') {
            worker.postMessage({ action: "START_CONTROL_RIGHT" });
        }
        if (event.code === 'ArrowUp' || event.key === 'w') {
            worker.postMessage({ action: "START_CONTROL_UP" });
        }
        if (event.code === 'ArrowDown' || event.key === 's') {
            worker.postMessage({ action: "START_CONTROL_DOWN" });
        }

        if (event.code === 'KeyP') {
            worker.postMessage({ action: mode.pause ? "PAUSE_OFF" : "PAUSE_ON" });
            if (!mode.pause) {
                audio.pauseMusic();
            }
            else {
                audio.loadMusic(scene.themeSong);
            }
        }
        else {
            startPlaying();
            //audio.loadMusic(scene.themeSong);
        }

        
    }

    event.preventDefault();
    event.stopPropagation();
};

const onGameKeyupListener = event => {

    if (gameState.state === STATES.TITLE) {
        gameState.setState(STATES.PLAY);
        audio.loadMusic(scene.themeSong);
    }
    else if (gameState.state === STATES.END) {

    }
    else if (gameState.state === STATES.PLAY) {
        if (event.code === 'ArrowLeft' || event.key === 'a') {
            worker.postMessage({ action: "STOP_CONTROL_LEFT" });
        }
        if (event.code === 'ArrowRight' || event.key === 'd') {
            worker.postMessage({ action: "STOP_CONTROL_RIGHT" });
        }
        if (event.code === 'ArrowUp' || event.key === 'w') {
            worker.postMessage({ action: "STOP_CONTROL_UP" });
        }
        if (event.code === 'ArrowDown' || event.key === 's') {
            worker.postMessage({ action: "STOP_CONTROL_DOWN" });
        }
        if (event.code === 'KeyR' && typeof editor === "undefined") {
            resetScene();
        }
        //else if (event.code === 'KeyE' && typeof editor === "undefined") {
        //    gameState.setState(STATES.END);
        //}
        else if (event.code === 'Enter') {
            
            if (state.completed) {
                openNext();
            }
            else if (state.failed) {
                resetScene();
            }

        }
    }
    event.preventDefault();
    event.stopPropagation();
};

async function loadAlbum(id) {
    try {
        const res = await fetch(`/albums/${id}/album.json`);
        return await res.json();
    }
    catch(error) {
        console.error(error);
        throw new Error(`Looks like there is no album ${id}`);
    }
}

function init({ width, height }) {
    canvas = document.getElementById('game-canvas');
    canvas.width = width || canvas.width;
    canvas.height = height || canvas.height;
    context = canvas.getContext('2d', { alpha: false });
    context.font = FONT;
}

const initGame = async ({ sceneId, albumId, width, height, scale = 1, volume }) => {

    init({ width, height });

    if (window.devicePixelRatio == 2 && scale !== 1) {
        width = canvas.width;
        height = canvas.height;
        canvas.setAttribute('width', width * scale);
        canvas.setAttribute('height', height * scale);
        canvasScale = scale;
        //context.scale(scale, scale);
        //context.translate(-width,-height);
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
    }

    document.addEventListener("keydown", onGameKeydownListener, false);
    document.addEventListener("keyup", onGameKeyupListener, false);

    document.getElementById("game-canvas").addEventListener("touchstart", (event) => {
        //console.log(event);
        //console.log();

        if (event.touches.length > 1) {
            controls.doubleTouch = true;
            worker.postMessage({ action: "START_CONTROL_UP" });
        }
        else {
            if (event.touches[0].clientX > document.body.getBoundingClientRect().width / 2) {
                controls.rightTouch = true;
                controls.touchX = event.touches[0].clientX - canvas.offsetLeft;
                controls.touchY = event.touches[0].clientY - canvas.offsetTop;
                worker.postMessage({ action: "START_CONTROL_RIGHT" });
            }
            if (event.touches[0].clientX < document.body.getBoundingClientRect().width / 2) {
                controls.leftTouch = true;
                controls.touchX = event.touches[0].clientX - canvas.offsetLeft;
                controls.touchY = event.touches[0].clientY - canvas.offsetTop;
                worker.postMessage({ action: "START_CONTROL_LEFT" });
            }
        }
        startPlaying();
        event.preventDefault();
    });

    document.getElementById("game-canvas").addEventListener("touchend", (event) => {
        //console.log(event);

        if (controls.doubleTouch) {
            controls.doubleTouch = false;
            worker.postMessage({ action: "STOP_CONTROL_UP" });
        }
        else {
            if (controls.rightTouch) {
                controls.rightTouch = false;
                worker.postMessage({ action: "STOP_CONTROL_RIGHT" });
            }
            if (controls.leftTouch) {
                controls.leftTouch = false;
                worker.postMessage({ action: "STOP_CONTROL_LEFT" });
            }
        }


        event.preventDefault();
    });

    if (!localStorage.getItem("duckface-best-times")) {
        localStorage.setItem("duckface-best-times", "{}");
    }

    gameState.init(STATES.TITLE);

    if (sceneId) {
        await loadScene({ sceneId, albumId });
        resetCamera();
    }

    audio.init({ volume });

    requestAnimationFrame(mainloop);
}

async function loadScene({ url, sceneId, albumId }) {

    if (sceneId === "from-editor") {
        const json = localStorage.getItem("duckface-editor-scene");
        scene = new Scene(JSON.parse(json));
        resetScene();
        return;
    }

    if (!url) {
        url = `/albums/${albumId}/scenes/${sceneId}.json`;
    }

    const result = await fetch(url);
    scene = new Scene(await result.json());

    resetScene();
}

const resetScene = () => {

    worker.postMessage({ action: "STOP" });
    updateTileCanvases(true);
    worker.postMessage({ action: "SET_SCENE", scene, spriteTypes });

    if (scene.captions.length > 0) {
        showCaptions = true;
        isPlayerReady = false;
    }
    else {
        showCaptions = false;
        isPlayerReady = true;
        worker.postMessage({ action: "RUN" });
    }

    if (typeof editor === "undefined") {
        resetCamera();
        sceneBestTime = getSceneBestTime(scene.id, scene.version);
    }

    sceneLoadedTime = Date.now();

    particles = [];

    tileLayers.update = true;

    effects.redraw = true;

    gameState.resetCurrentState();
}

function startPlaying() {

    showCaptions = false;

    if (!isPlayerReady) {
        isPlayerReady = true;
        sceneStartTime = Date.now();
        sceneCompletionTime = -1;
        sceneFailedTime = -1;
        worker.postMessage({ action: "RUN" });
    }

    audio.loadMusic(scene.themeSong);
}

function mainloop() {

    if (gameState.state === STATES.TITLE) {
        if (Date.now() - gameState.stateStartTime > 5000) {
            gameState.setState(STATES.PLAY);
        }
    }
    else if (gameState.state === STATES.PLAY) {

        if (dataFromWorker !== null) {
            sprites = dataFromWorker.sprites;
            state = dataFromWorker.state;
            mode = dataFromWorker.mode;
        }

        if (typeof editor === "undefined") {
            if (isPlayerReady && state.completed && sceneCompletionTime === -1) {
                audio.playSound({ sound: "fanfare" });
                sceneCompletionTime = Date.now() - sceneStartTime;

                if (sceneBestTime !== undefined) {
                    if (sceneBestTime > sceneCompletionTime) {
                        saveSceneBestTime(scene.id, scene.version, sceneCompletionTime);
                    }
                }
                else {
                    saveSceneBestTime(scene.id, scene.version, sceneCompletionTime);
                }
            }

            if (isPlayerReady && state.failed && sceneFailedTime === -1) {
                sceneFailedTime = Date.now() - sceneStartTime;
            }
        }

        if (camera.enabled) {
            moveCamera();
        }

        moveParticles();
    }

    draw();

    requestAnimationFrame(mainloop);
}

function getSceneBestTime(sceneId, version) {
    const bestTimes = JSON.parse(localStorage.getItem("duckface-best-times") || "{}");
    const majorVersionNumber = version.split(".")[0];
    return bestTimes[`${album.id}-${sceneId}-${majorVersionNumber}`];
}

function saveSceneBestTime(sceneId, version = "1.0", sceneCompletionTime) {
    const bestTimes = JSON.parse(localStorage.getItem("duckface-best-times") || "{}");
    const majorVersionNumber = version.split(".")[0];
    bestTimes[`${album.id}-${sceneId}-${majorVersionNumber}`] = sceneCompletionTime;
    localStorage.setItem("duckface-best-times", JSON.stringify(bestTimes));
}

function resetCamera() {
    const player = scene.sprites.find(sprite => sprite.isPlayer);
    camera.x = player && player.x - canvas.width / 2 || 0;
    camera.y = player && player.y - canvas.height / 2 || 0;
}

function moveCamera() {

    const targets = sprites.filter(sprite => sprite.isPlayer);

    let prevCameraX = camera.pixelX;
    let prevCameraY = camera.pixelY;

    if (targets.length > 0) {
        let targetX = 0;
        let targetY = 0;
        targetX = Math.floor(targets[0].x - canvas.width / 2);
        targetY = Math.floor(targets[0].y - canvas.height / 2);

        targetX = Math.min(scene.right - canvas.width, Math.max(scene.left, targetX));
        targetY = Math.min(scene.bottom - canvas.height, Math.max(scene.top, targetY));

        const vector = {
            x: targetX - camera.x,
            y: targetY - camera.y
        }
        const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        vector.x = length > 0 ? vector.x / length : 0;
        vector.y = length > 0 ? vector.y / length : 0;

        camera.x += vector.x * length / 20;
        camera.y += vector.y * length / 20;
    }

    camera.x = Math.min(scene.right - canvas.width, Math.max(scene.left, camera.x));
    camera.y = Math.min(scene.bottom - canvas.height, Math.max(scene.top, camera.y));

    if (prevCameraX !== camera.pixelX || prevCameraY !== camera.pixelY) {
        tileLayers.update = true;
    }
}

function emitParticles({ particleTypeId, particleProps, amount }) {
    for (let i = 0; i < amount; i++) {
        if (particleProps.x > camera.pixelX && particleProps.x < camera.pixelX + canvas.width
            && particleProps.y > camera.pixelY && particleProps.y < camera.pixelY + canvas.height) {
            addParticle(particleTypes[particleTypeId], particleProps);
        }
    }
}

function addParticle(type, props) {
    particles.push(type.create(props));
}

function moveParticles() {

    particles.forEach(particle => {
        particle.type.move(particle);
    });
    particles = particles.filter(particle => particle.startTime + particle.duration > Date.now());
}

let frames = 0;
function logFps() {
    //console.log("fps: " + frames);
    frames = 0;
}

setInterval(logFps, 1000);