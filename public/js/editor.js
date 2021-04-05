'use strict';

// Refactoring
// - add method to editor
// - refactor callers
// - add property to editor
// - updateUI
// - update draw tool
// - update select tiles / sprites

const RESIZE_HANDLE_WIDTH = 8;
const RESIZE_HANDLE_HEIGHT = 8;

const editor = {
    dragMode: undefined,
    dragHandle: undefined,
    grid: {
        width: 8,
        height: 8
    },
    idsOfSelectedTiles: [],
    idsOfSelectedSprites: [],

    undoHistory: [],

    showSpriteIds: false,
    showTileId: false,

    showSource: false,
    prettyPrintSource: true,

    tileLayer: LAYERS.MIDDLE,
    tileMaterialId: "default",
    fillColor: "#B08080",
    strokeColor: "#383838",
    transparent: false,
    opacity: 1.0,
    blocks: true,
    borders: { t: true, r: true, b: true, l: true },
    isPlayer: false,
    spriteDirection: DIRECTION.RIGHT,

    clearScene() {
        this.save();
        this.idsOfSelectedTiles = [];
        this.idsOfSelectedSprites = [];
        scene.tiles.forEach(tile => {
            removeTileCanvasById(tile.id);
        });
        scene = new Scene({});
        this.resetCamera();
        this.updateUI();
        worker.postMessage({ action: "SET_SCENE", scene });
        tileLayers.update = true;
    },

    async loadScene({ sceneId, albumId, url }) {
        await loadScene({ sceneId, albumId, url });
        scene.sprites.forEach(sprite => {
            // in old scenes not all sprites have width and height
            if (sprite.width === undefined) {
                sprite.width = spriteTypes[sprite.typeId].spriteProps.width || 16;
            }
            if (sprite.height === undefined) {
                sprite.height = spriteTypes[sprite.typeId].spriteProps.height || 16;
            }
        });
        this.resetCamera();
        this.updateUI();
    },

    async saveSceneToServer() {
        const authorKey = document.getElementById("author-key").value;
        const requestId = generateId();

        if (authorKey === "") {
            alert("You need an author key to save scenes to the server. Request one from Janne Kivilahti at Discord or at the Piste Gamez forum.")
            return;
        }

        try {
            const response = await fetch(`https://api.duckface.lol/v1/scene`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    scene,
                    requestId,
                    authorKey
                })
            });

            if (response.ok) {
                alert(`Scene ${scene.id} saved to server.`);
                const data = await response.json();
                scene = new Scene(data.scene);
                this.updateUI();
            }
            else if (response.status === 400 || response.status === 403) {
                const message = await response.text();
                alert(`Saving failed: ${response.status} ${message}`);
            }
            else {
                alert(`Error ${response.status} saving scene. Report id ${requestId} to Discord or Piste Gamez forum.`);
            }
        }
        catch (error) {
            console.log(error);
            alert(`Saving failed: ${error.message}`);
        }
    },

    async loadSceneFromServer() {
        const response = await fetch(`https://api.duckface.lol/v1/scenes`);
        if (response.ok) {
            alert(`Scene ${scene.id} saved to server. Remember the id!`);
        }
    },

    async deleteSceneFromServer() {

        if (!confirm("Just making sure you really want to delete scene " + scene.title + "?")) {
            return;
        }

        const authorKey = document.getElementById("author-key").value;
        const requestId = generateId();

        if (authorKey === "") {
            alert("You need an author key to save scenes to the server. Request one from Janne Kivilahti at Discord or at the Piste Gamez forum.")
            return;
        }

        try {
            const response = await fetch(`https://api.duckface.lol/v1/scene/${scene.id}`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    requestId,
                    authorKey
                })
            });

            if (response.ok) {
                alert(`Scene ${scene.id} deleted.`);
            }
            else if (response.status === 400 || response.status === 403) {
                const message = await response.text();
                alert(`Deleting failed: ${response.status} ${message}`);
            }
            else {
                alert(`Error ${response.status} deleting scene. Report id ${requestId} to Discord or Piste Gamez forum.`);
            }
        }
        catch (error) {
            console.log(error);
            alert(`Saving failed: ${error.message}`);
        }
    },

    setAuthorKey(value) {
        localStorage.setItem("duckface-author-key", value);
    },

    resetCamera() {
        camera.x = Math.floor((scene.width / 2 - canvas.width / 2) / editor.grid.width) * editor.grid.width;
        camera.y = Math.floor((scene.height / 2 - canvas.height / 2) / editor.grid.height) * editor.grid.height;
    },

    setSceneFromJSON(json) {
        this.save();
        scene = new Scene(JSON.parse(json));
        this.updateUI();
        worker.postMessage({ action: "SET_SCENE", scene });
        tileLayers.update = true;
        resetScene();
    },

    save() {
        this.undoHistory[0] = JSON.stringify(scene);
    },

    undo() {
        if (this.undoHistory[0]) {
            const previous = new Scene(JSON.parse(this.undoHistory[0]));
            this.save();
            scene = previous;
            this.idsOfSelectedTiles = [];
            this.idsOfSelectedSprites = [];
            this.updateUI();
            tileLayers.update = true;
        }
    },

    toggleSource() {
        this.showSource = !this.showSource;
        this.updateUI();
    },

    setPrettyPrintSource(value) {
        this.prettyPrintSource = value;
        this.updateUI();
    },

    stashScene() {
        localStorage.setItem("duckface-editor-scene", document.getElementById("source").value);
    },

    setSceneId(value) {
        this.save();
        scene.id = value;
        this.updateUI();
    },

    setSceneTitle(value) {
        this.save();
        scene.title = value;
        this.updateUI();
    },

    setSceneAuthor(value) {
        this.save();
        scene.author = value;
        this.updateUI();
    },

    setSceneVersion(value) {
        this.save();
        scene.version = value;
        this.updateUI();
    },

    setSceneThemeSong(value) {
        this.save();
        scene.themeSong = value;
        this.updateUI();
    },

    setSceneSize({ top, right, bottom, left }) {
        this.save();
        if (top) scene.top = parseInt(top);
        if (right) scene.right = parseInt(right);
        if (bottom) scene.bottom = parseInt(bottom);
        if (left) scene.left = parseInt(left);
        this.updateUI();
    },

    setSceneBackgroundColor(color) {
        this.save();
        scene.bgColor = color; //document.getElementById('scene.bgColor').value;
        this.updateUI();
    },

    setSceneHorizontalLooping(value) {
        this.save();
        scene.horizontalLoop = value;
        this.updateUI();
        /*
        worker.postMessage({
            action: "UPDATE_SCENE_LOOPING",
            horizontalLooping: scene.horizontalLoop,
            verticalLooping: scene.verticalLoop
        });*/
    },

    setSceneVerticalLooping(value) {
        this.save();
        scene.verticalLoop = value;
        this.updateUI();
    },

    addTile(props) {
        this.save();
        const tile = new Tile(props);
        scene.tiles.push(tile);
        //worker.postMessage({ action: "UPDATE", tiles: scene.tiles });
        worker.postMessage({ action: "ADD_TILE", tile: props });
        updateTileCanvas(tile, true);
        tileLayers.update = true;
    },

    addSprite(props) {
        this.save();
        const sprite = {
            id: generateId(),
            ...props
        };
        scene.sprites.push(sprite);
        worker.postMessage({ action: "ADD_SPRITE", sprite });
    },

    removeSelected() {
        this.save();
        scene.tiles = scene.tiles.filter(tile => !this.idsOfSelectedTiles.includes(tile.id));
        scene.sprites = scene.sprites.filter(sprite => !this.idsOfSelectedSprites.includes(sprite.id));
        worker.postMessage({
            action: "DELETE",
            tileIds: [...this.idsOfSelectedTiles],
            spriteIds: [...this.idsOfSelectedSprites]
        });

        this.idsOfSelectedTiles.forEach(tile => {
            removeTileCanvasById(tile.id);
        });

        this.idsOfSelectedTiles = [];
        this.idsOfSelectedSprites = [];
        tileLayers.update = true;
    },

    setTileLayer(value) {
        this.save();
        this.tileLayer = parseInt(value);
        if (this.idsOfSelectedTiles.length > 0) {
            this.idsOfSelectedTiles
                .map(id => scene.tiles.find(tile => tile.id === id))
                .forEach(tile => {
                    tile.layer = this.tileLayer;
                });
        }
        this.updateUI();
        tileLayers.update = true;
    },

    selectSprites(sprites = []) {
        this.idsOfSelectedSprites = sprites.map(sprite => sprite.id);

        if (sprites.length === 1) {
            this.isPlayer = sprites[0].isPlayer;
            this.spriteDirection = sprites[0].direction;
        }

        this.updateUI();
    },

    selectAllTilesInCurrentLayer() {
        this.selectTiles(scene.tiles.filter(tile => tile.layer === editor.tileLayer));
    },

    selectTiles(tiles = [], reset = true) {

        this.idsOfSelectedTiles = this.idsOfSelectedTiles.filter(id => !tiles.includes(tile => tile.id === id));
        this.idsOfSelectedTiles.push(...tiles.map(tile => tile.id));

        if (tiles.length === 1) {
            document.getElementById("width").value = tiles[0].width;
            document.getElementById("height").value = tiles[0].height;
            document.getElementById("x").value = tiles[0].x;
            document.getElementById("y").value = tiles[0].y;
            document.getElementById("z").value = tiles[0].z;
            this.borders = { ...tiles[0].borders };
            this.fillColor = tiles[0].color;
            this.transparent = tiles[0].transparent;
            this.blocks = tiles[0].blocks;
            this.tileMaterialId = tiles[0].materialId;
            this.strokeColor = tiles[0].stroke;
            this.opacity = tiles[0].opacity;
        }
        else {
            if (new Set(tiles.map(tile => tile.color)).size === 1) {
                this.fillColor = tiles[0].color;
            }
            if (new Set(tiles.map(tile => "" + tile.transparent)).size === 1) {
                this.transparent = tiles[0].transparent;
            }
            if (new Set(tiles.map(tile => "" + tile.blocks)).size === 1) {
                this.blocks = tiles[0].blocks;
            }
            if (new Set(tiles.map(tile => tile.materialId)).size === 1) {
                this.tileMaterialId = tiles[0].materialId;
            }
            if (new Set(tiles.map(tile => tile.stroke)).size === 1) {
                this.strokeColor = tiles[0].stroke;
            }
            if (new Set(tiles.map(tile => tile.opacity)).size === 1) {
                this.opacity = tiles[0].opacity;
            }
            if (new Set(tiles.map(tile => tile.x)).size === 1) {
                document.getElementById("x").value = tiles[0].x;
            }
            if (new Set(tiles.map(tile => tile.y)).size === 1) {
                document.getElementById("y").value = tiles[0].y;
            }
            if (new Set(tiles.map(tile => tile.z)).size === 1) {
                document.getElementById("z").value = tiles[0].z;
            }
        }

        this.updateUI();
    },

    setPosition({ x, y, z }) {
        this.save();
        if (editor.idsOfSelectedTiles.length > 0) {
            editor.idsOfSelectedTiles.forEach(id => {
                const tile = scene.tiles.find(tile => tile.id === id);
                if (x !== undefined) tile.x = parseInt(x);
                if (y !== undefined) tile.y = parseInt(y);
                if (z !== undefined) tile.z = parseFloat(z);
            });
            worker.postMessage({
                action: "UPDATE",
                tiles: scene.tiles
            });
        }
        tileLayers.update = true;
    },

    setTileFillColor(color) {
        this.save();
        this.fillColor = color;

        this.idsOfSelectedTiles.forEach(id => {
            const tile = scene.tiles.find(tile => tile.id === id);
            tile.color = this.fillColor;
            updateTileCanvas(tile, true);
        });

        this.updateUI();
        tileLayers.update = true;
    },

    setTileStrokeColor(color) {
        this.save();
        this.strokeColor = color;

        this.idsOfSelectedTiles.forEach(id => {
            const tile = scene.tiles.find(tile => tile.id === id);
            tile.stroke = this.strokeColor;
            updateTileCanvas(tile, true);
        });

        this.updateUI();
        tileLayers.update = true;
    },

    setTileOpacity(value) {
        this.save();
        this.opacity = value;

        this.idsOfSelectedTiles.forEach(id => {
            const tile = scene.tiles.find(tile => tile.id === id);
            tile.opacity = this.opacity;
            updateTileCanvas(tile, true);
        });

        this.updateUI();
        tileLayers.update = true;
    },

    setTileTransparency(value) {
        this.save();
        this.transparent = value;

        this.idsOfSelectedTiles.forEach(id => {
            const tile = scene.tiles.find(tile => tile.id === id);
            tile.transparent = this.transparent;
            updateTileCanvas(tile, true);
        });

        this.updateUI();
        tileLayers.update = true;
    },

    setTileBlocks(value) {
        this.save();
        this.blocks = value;

        this.idsOfSelectedTiles.forEach(id => {
            const tile = scene.tiles.find(tile => tile.id === id);
            tile.blocks = this.blocks;
        });
        worker.postMessage({
            action: "UPDATE",
            tiles: scene.tiles
        });
        this.updateUI();
    },

    setTileMaterial(value) {
        this.save();
        this.tileMaterialId = value;

        this.idsOfSelectedTiles.forEach(id => {
            const tile = scene.tiles.find(tile => tile.id === id);
            tile.materialId = this.tileMaterialId;
            updateTileCanvas(tile, true);
        });
        worker.postMessage({
            action: "UPDATE",
            tiles: scene.tiles
        });
        this.updateUI();
        tileLayers.update = true;
    },

    setTileBorders(borders) {
        this.save();
        this.borders = borders || {
            t: document.getElementById('tile-borders-top').checked,
            r: document.getElementById('tile-borders-right').checked,
            b: document.getElementById('tile-borders-bottom').checked,
            l: document.getElementById('tile-borders-left').checked
        };

        this.idsOfSelectedTiles.forEach(id => {
            const tile = scene.tiles.find(tile => tile.id === id);
            tile.borders = { ...this.borders };
            updateTileCanvas(tile, true);
        });

        this.updateUI();
        tileLayers.update = true;
    },

    setSpriteIsPlayer(value) {
        this.save();
        this.isPlayer = value;
        if (this.idsOfSelectedSprites.length > 0) {
            this.idsOfSelectedSprites
                .map(id => scene.sprites.find(sprite => sprite.id === id))
                .forEach(sprite => {
                    sprite.isPlayer = this.isPlayer;
                });

            worker.postMessage({
                action: "UPDATE",
                sprites: this.idsOfSelectedSprites.map(id => scene.sprites.find(sprite => sprite.id === id))
            });
        }
        this.updateUI();
    },

    setSpriteDirection(value) {
        this.save();
        this.spriteDirection = value;
        if (this.idsOfSelectedSprites.length > 0) {
            this.idsOfSelectedSprites
                .map(id => scene.sprites.find(sprite => sprite.id === id))
                .forEach(sprite => {
                    sprite.direction = this.spriteDirection;
                });
            worker.postMessage({
                action: "UPDATE",
                sprites: this.idsOfSelectedSprites.map(id => scene.sprites.find(sprite => sprite.id === id))
            });
        }
        this.updateUI();
    },

    onUseGameCameraChange(value) {
        camera.enabled = value;
        camera.x = Math.floor(camera.x / editor.grid.width) * editor.grid.width;
        camera.y = Math.floor(camera.y / editor.grid.height) * editor.grid.height;
        this.updateUI();
    },

    moveToBack() {
        this.save();
        if (this.idsOfSelectedSprites.length > 0) {
            let selectedSprites = this.idsOfSelectedSprites.map(id => scene.sprites.find(sprite => sprite.id === id));
            let otherSprites = scene.sprites.filter(sprite => !this.idsOfSelectedSprites.includes(sprite.id));
            scene.sprites = selectedSprites;
            scene.sprites.push(...otherSprites);
            worker.postMessage({
                action: "UPDATE_ORDER",
                sprites: scene.sprites
            });
        }
        if (this.idsOfSelectedTiles.length > 0) {
            let selectedTiles = this.idsOfSelectedTiles.map(id => scene.tiles.find(sprite => sprite.id === id));
            let otherTiles = scene.tiles.filter(sprite => !this.idsOfSelectedTiles.includes(sprite.id));
            scene.tiles = selectedTiles;
            scene.tiles.push(...otherTiles);
            /*
            worker.postMessage({
                action: "UPDATE",
                tiles: scene.tiles
            });
            */
        }
        tileLayers.update = true;
    },

    moveToFront() {
        this.save();
        if (this.idsOfSelectedSprites.length > 0) {
            let selectedSprites = this.idsOfSelectedSprites.map(id => scene.sprites.find(sprite => sprite.id === id));
            let otherSprites = scene.sprites.filter(sprite => !this.idsOfSelectedSprites.includes(sprite.id));
            scene.sprites = otherSprites;
            scene.sprites.push(...selectedSprites);
            worker.postMessage({
                action: "UPDATE_ORDER",
                sprites: scene.sprites
            });
        }
        if (this.idsOfSelectedTiles.length > 0) {
            let selectedTiles = this.idsOfSelectedTiles.map(id => scene.tiles.find(tile => tile.id === id));
            let otherTiles = scene.tiles.filter(tile => !this.idsOfSelectedTiles.includes(tile.id));
            scene.tiles = otherTiles;
            scene.tiles.push(...selectedTiles);
            /*
            worker.postMessage({
                action: "UPDATE",
                tiles: scene.tiles
            });
            */
        }
        tileLayers.update = true;
    },

    setWidth(value) {
        this.save();

        if (this.idsOfSelectedTiles.length > 0) {
            this.idsOfSelectedTiles.forEach(id => {
                const tile = scene.tiles.find(tile => tile.id === id);
                tile.width = value;
                updateTileCanvas(tile, true);
            });
            worker.postMessage({
                action: "UPDATE",
                tiles: scene.tiles
            });
        }

        document.getElementById("width").value = value;
        tileLayers.update = true;
    },

    setHeight(value) {
        this.save();

        if (this.idsOfSelectedTiles.length > 0) {
            this.idsOfSelectedTiles.forEach(id => {
                const tile = scene.tiles.find(tile => tile.id === id);
                tile.height = value;
                updateTileCanvas(tile, true);
            });
            worker.postMessage({
                action: "UPDATE",
                tiles: scene.tiles
            });
        }

        document.getElementById("height").value = value;
        tileLayers.update = true;
    },

    updateUI() {

        document.getElementById("source").value = JSON.stringify(scene, null, this.prettyPrintSource ? ' ' : undefined);
        document.getElementById("pretty-print-source").checked = this.prettyPrintSource;
        //const dialog = document.getElementById("source-dialog");
        document.getElementById("source-dialog").style.display = this.showSource ? "" : "none";

        document.getElementById("use-game-camera").checked = camera.enabled;

        document.getElementById("scene.id").value = scene.id;
        document.getElementById("scene.title").value = scene.title;
        document.getElementById("scene.author").value = scene.author;
        document.getElementById("scene.version").value = scene.version;
        document.getElementById("scene.themeSong").value = scene.themeSong;
        document.getElementById("scene.top").value = scene.top;
        document.getElementById("scene.right").value = scene.right;
        document.getElementById("scene.bottom").value = scene.bottom;
        document.getElementById("scene.left").value = scene.left;
        document.getElementById("scene.bgColor").value = scene.bgColor;
        document.getElementById("scene.horizontalLoop").checked = scene.horizontalLoop;
        document.getElementById("scene.verticalLoop").checked = scene.verticalLoop;

        document.getElementById('fill-color').value = this.fillColor;
        document.getElementById('stroke-color').value = this.strokeColor;
        document.getElementById('opacity').value = this.opacity;
        document.getElementById('fill-transparent').checked = this.transparent;
        document.getElementById('tile-blocks').checked = this.blocks;
        document.getElementById('tile-material').value = this.tileMaterialId;
        document.getElementById('tile-borders-top').checked = this.borders.t;
        document.getElementById('tile-borders-right').checked = this.borders.r;
        document.getElementById('tile-borders-bottom').checked = this.borders.b;
        document.getElementById('tile-borders-left').checked = this.borders.l;

        document.getElementById('sprite-is-player').checked = this.isPlayer;
        document.getElementById('sprite-direction-left').checked = this.spriteDirection === DIRECTION.LEFT;
        document.getElementById('sprite-direction-right').checked = this.spriteDirection === DIRECTION.RIGHT;

        document.getElementById('author-key').value = localStorage.getItem("duckface-author-key") || "";

        const fillPaletteElement = document.getElementById("fill-color-palette");
        fillPaletteElement.innerHTML = "";
        const colors = new Set([
            scene.bgColor,
            ...scene.tiles.map(tile => tile.color),
            ...scene.tiles.map(tile => tile.stroke)
        ]);
        Array.from(colors)
            .sort((c1, c2) => c1.localeCompare(c2))
            .forEach(color => {
                const button = document.createElement('button');
                button.style.backgroundColor = color;
                button.className = "color";
                button.type = "button";
                button.title = color;
                button.dataset.color = color;
                button.oncontextmenu = () => { return false };
                button.onmousedown = function (event) {
                    if (event.which === 1) {
                        editor.setTileFillColor(this.dataset.color);
                    }
                    else {
                        editor.setTileStrokeColor(this.dataset.color);
                    }
                    event.preventDefault();
                    event.stopPropagation();
                }.bind(button);
                fillPaletteElement.appendChild(button);
            })
    },
}

function hasInputFocus() {
    return document.querySelector('input:focus') !== null || document.querySelector('textarea:focus') !== null;
}

const onMouseDownListener = event => {

    if (hasInputFocus()) {
        return;
    }

    controls.mouseLeft = event.which === 1;
    controls.mouseRight = event.which === 3;
    controls.mouseX = Math.round(event.pageX - canvas.offsetLeft) + camera.pixelX;
    controls.mouseY = Math.round(event.pageY - canvas.offsetTop) + camera.pixelY;
    controls.startMouseX = Math.round(controls.mouseX / editor.grid.width) * editor.grid.width;
    controls.startMouseY = Math.round(controls.mouseY / editor.grid.height) * editor.grid.height;
    controls.endMouseX = controls.startMouseX;
    controls.endMouseY = controls.startMouseY;

    const clickedTiles = editor.idsOfSelectedTiles
        .map(id => scene.tiles.find(tile => tile.id === id))
        .filter(tile => tile.x <= controls.mouseX && tile.x + tile.width >= controls.mouseX &&
            tile.y <= controls.mouseY && tile.y + tile.height >= controls.mouseY);

    const clickedSprites = editor.idsOfSelectedSprites
        .map(id => scene.sprites.find(sprite => sprite.id === id))
        .filter(sprite => sprite.x <= controls.mouseX && sprite.x + sprite.width >= controls.mouseX &&
            sprite.y <= controls.mouseY && sprite.y + sprite.height >= controls.mouseY);

    if (clickedTiles.length === 0 && clickedSprites.length === 0) {
        editor.dragMode = "DRAW";
    }
    else if (clickedTiles.length > 0) {

        clickedTiles.forEach(tile => {
            if (controls.mouseX < tile.x + Math.max(tile.width / 4, RESIZE_HANDLE_WIDTH)) {
                editor.resizeDirection = DIRECTION.LEFT;
                editor.dragMode = "RESIZE_TILES";
            }
            else if (controls.mouseX > tile.x + tile.width - Math.max(tile.width / 4, RESIZE_HANDLE_WIDTH)) {
                editor.resizeDirection = DIRECTION.RIGHT;
                editor.dragMode = "RESIZE_TILES";
            }
            else if (controls.mouseY < tile.y + Math.max(tile.height / 4, RESIZE_HANDLE_HEIGHT)) {
                editor.resizeDirection = DIRECTION.TOP;
                editor.dragMode = "RESIZE_TILES";
            }
            else if (controls.mouseY > tile.y + tile.height - Math.max(tile.height / 4, RESIZE_HANDLE_HEIGHT)) {
                editor.resizeDirection = DIRECTION.BOTTOM;
                editor.dragMode = "RESIZE_TILES";
            }
            else {
                editor.dragMode = "MOVE_TILES";
            }
        });
    }
    else if (clickedSprites.length > 0) {
        clickedSprites.forEach(sprite => {
            if (spriteTypes[sprite.typeId].resizable) {
                if (controls.mouseX < sprite.x + Math.max(sprite.width / 4, RESIZE_HANDLE_WIDTH)) {
                    editor.resizeDirection = DIRECTION.LEFT;
                    editor.dragMode = "RESIZE_SPRITES";
                }
                else if (controls.mouseX > sprite.x + sprite.width - Math.max(sprite.width / 4, RESIZE_HANDLE_WIDTH)) {
                    editor.resizeDirection = DIRECTION.RIGHT;
                    editor.dragMode = "RESIZE_SPRITES";
                }
                else if (controls.mouseY < sprite.y + Math.max(sprite.height / 4, RESIZE_HANDLE_HEIGHT)) {
                    editor.resizeDirection = DIRECTION.TOP;
                    editor.dragMode = "RESIZE_SPRITES";
                }
                else if (controls.mouseY > sprite.y + sprite.height - Math.max(sprite.height / 4, RESIZE_HANDLE_HEIGHT)) {
                    editor.resizeDirection = DIRECTION.BOTTOM;
                    editor.dragMode = "RESIZE_SPRITES";
                }
                else {
                    editor.dragMode = "MOVE_SPRITES";
                }
            } else {
                editor.dragMode = "MOVE_SPRITES";
            }
        });
    }

    event.preventDefault();
    event.stopPropagation();

    //console.log(event);
};

const onMouseMoveListener = event => {

    if (hasInputFocus()) {
        return;
    }

    controls.mousePixelX = Math.round((event.pageX - canvas.offsetLeft)) + camera.pixelX;
    controls.mousePixelY = Math.round((event.pageY - canvas.offsetTop)) + camera.pixelY;

    controls.mouseX = Math.round((event.pageX - canvas.offsetLeft) / editor.grid.width) * editor.grid.width + camera.pixelX;
    controls.mouseY = Math.round((event.pageY - canvas.offsetTop) / editor.grid.height) * editor.grid.height + camera.pixelY;

    if (controls.mouseLeft || controls.mouseRight) {
        controls.endMouseX = controls.mouseX;
        controls.endMouseY = controls.mouseY;
    }
};

const onMouseUpListener = event => {

    if (hasInputFocus()) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    controls.endMouseX = Math.round((event.pageX - canvas.offsetLeft) / editor.grid.width) * editor.grid.width + camera.pixelX;
    controls.endMouseY = Math.round((event.pageY - canvas.offsetTop) / editor.grid.height) * editor.grid.height + camera.pixelY;

    const area = {
        x: Math.min(controls.startMouseX, controls.endMouseX),
        y: Math.min(controls.startMouseY, controls.endMouseY),
        width: Math.max(controls.startMouseX, controls.endMouseX) - Math.min(controls.startMouseX, controls.endMouseX),
        height: Math.max(controls.startMouseY, controls.endMouseY) - Math.min(controls.startMouseY, controls.endMouseY)
    };

    const tool = document.querySelector('input[name="tool"]:checked').value;

    let message = null;

    if (editor.dragMode === "RESIZE_TILES") {
        editor.save();
        editor.idsOfSelectedTiles
            .map(id => scene.tiles.find(tile => tile.id === id))
            .forEach(tile => {
                if (editor.resizeDirection === DIRECTION.LEFT) {
                    const left = Math.min(tile.x + controls.endMouseX - controls.startMouseX, tile.x + tile.width);
                    const right = Math.max(tile.x + controls.endMouseX - controls.startMouseX, tile.x + tile.width);
                    tile.width = right - left;
                    tile.x = left;
                }
                if (editor.resizeDirection === DIRECTION.RIGHT) {
                    const left = Math.min(tile.x + tile.width + controls.endMouseX - controls.startMouseX, tile.x);
                    const right = Math.max(tile.x + tile.width + controls.endMouseX - controls.startMouseX, tile.x);
                    tile.width = right - left;
                    tile.x = left;
                }
                if (editor.resizeDirection === DIRECTION.TOP) {
                    const top = Math.min(tile.y + controls.endMouseY - controls.startMouseY, tile.y + tile.height);
                    const bottom = Math.max(tile.y + controls.endMouseY - controls.startMouseY, tile.y + tile.height);
                    tile.height = bottom - top;
                    tile.y = top;
                }
                if (editor.resizeDirection === DIRECTION.BOTTOM) {
                    const top = Math.min(tile.y + tile.height + controls.endMouseY - controls.startMouseY, tile.y);
                    const bottom = Math.max(tile.y + tile.height + controls.endMouseY - controls.startMouseY, tile.y);
                    tile.height = bottom - top;
                    tile.y = top;
                }
                updateTileCanvas(tile);
                tileLayers.update = true;
            });

        worker.postMessage({
            action: "UPDATE",
            tiles: scene.tiles
        });
        tileLayers.update = true;
        //updateTileCanvases(true);
        // update JSON
    }
    else if (editor.dragMode === "MOVE_TILES") {
        editor.idsOfSelectedTiles
            .map(id => scene.tiles.find(tile => tile.id === id))
            .forEach(tile => {
                tile.x += controls.endMouseX - controls.startMouseX;
                tile.y += controls.endMouseY - controls.startMouseY;
            });

        worker.postMessage({
            action: "UPDATE",
            tiles: scene.tiles
        });
        tileLayers.update = true;
    }
    else if (editor.dragMode === "RESIZE_SPRITES") {
        editor.idsOfSelectedSprites
            .map(id => scene.sprites.find(sprite => sprite.id === id))
            .filter(sprite => spriteTypes[sprite.typeId].resizable)
            .forEach(sprite => {
                if (editor.resizeDirection === DIRECTION.LEFT) {
                    const left = Math.min(sprite.x + controls.endMouseX - controls.startMouseX, sprite.x + sprite.width);
                    const right = Math.max(sprite.x + controls.endMouseX - controls.startMouseX, sprite.x + sprite.width);
                    sprite.width = right - left;
                    sprite.x = left;
                }
                if (editor.resizeDirection === DIRECTION.RIGHT) {
                    const left = Math.min(sprite.x + sprite.width + controls.endMouseX - controls.startMouseX, sprite.x);
                    const right = Math.max(sprite.x + sprite.width + controls.endMouseX - controls.startMouseX, sprite.x);
                    sprite.width = right - left;
                    sprite.x = left;
                }
                if (editor.resizeDirection === DIRECTION.TOP) {
                    const top = Math.min(sprite.y + controls.endMouseY - controls.startMouseY, sprite.y + sprite.height);
                    const bottom = Math.max(sprite.y + controls.endMouseY - controls.startMouseY, sprite.y + sprite.height);
                    sprite.height = bottom - top;
                    sprite.y = top;
                }
                if (editor.resizeDirection === DIRECTION.BOTTOM) {
                    const top = Math.min(sprite.y + sprite.height + controls.endMouseY - controls.startMouseY, sprite.y);
                    const bottom = Math.max(sprite.y + sprite.height + controls.endMouseY - controls.startMouseY, sprite.y);
                    sprite.height = bottom - top;
                    sprite.y = top;
                }
            });

        worker.postMessage({
            action: "UPDATE",
            sprites: editor.idsOfSelectedSprites.map(id => {
                let sceneSprite = scene.sprites.find(sprite => sprite.id === id);
                let gameSprite = sprites.find(sprite => sprite.id === id);
                // shouldn't really modify the sprites-array : /

                if (editor.resizeDirection === DIRECTION.LEFT) {
                    gameSprite.x += gameSprite.width - sceneSprite.width;
                }

                if (editor.resizeDirection === DIRECTION.UP) {
                    gameSprite.y += gameSprite.height - sceneSprite.height;
                }
                gameSprite.width = sceneSprite.width;
                gameSprite.height = sceneSprite.height;
                return gameSprite;
            })
        });
    }
    else if (editor.dragMode === "MOVE_SPRITES") {
        editor.idsOfSelectedSprites
            .map(id => scene.sprites.find(sprite => sprite.id === id))
            .forEach(sprite => {
                let gameSprite = sprites.find(s => s.id === sprite.id);
                if (gameSprite) {
                    if (gameSprite.x === sprite.x && gameSprite.y === sprite.y) {
                        gameSprite.x += controls.endMouseX - controls.startMouseX;
                        gameSprite.y += controls.endMouseY - controls.startMouseY;
                    }
                    sprite.x += controls.endMouseX - controls.startMouseX;
                    sprite.y += controls.endMouseY - controls.startMouseY;
                }
            });

        worker.postMessage({
            action: "UPDATE",
            sprites: editor.idsOfSelectedSprites.map(id => sprites.find(sprite => sprite.id === id))
        });
    }
    else if (editor.dragMode === "DRAW" && controls.mouseLeft) {

        if (!event.shiftKey) {
            editor.idsOfSelectedSprites = [];
            editor.idsOfSelectedTiles = [];
        }

        if (area.width >= editor.grid.width && area.height >= editor.grid.height) {
            if (tool === "draw-tile-box") {
                editor.addTile({
                    id: generateId(),
                    shape: SHAPES.BOX,
                    color: editor.fillColor,
                    stroke: editor.strokeColor,
                    opacity: editor.opacity,
                    transparent: editor.transparent,
                    layer: editor.tileLayer,
                    blocks: editor.tileLayer === LAYERS.BACKGROUND ? false : editor.blocks,
                    materialId: editor.tileMaterialId,
                    borders: editor.borders,
                    ...area
                });
            }
            else if (tool === "draw-tile-slope-left") {
                editor.addTile({
                    id: generateId(),
                    shape: SHAPES.SLOPE_LEFT,
                    color: editor.fillColor,
                    stroke: editor.strokeColor,
                    opacity: editor.opacity,
                    transparent: editor.transparent,
                    layer: editor.tileLayer,
                    blocks: editor.tileLayer === LAYERS.BACKGROUND ? false : editor.blocks,
                    materialId: editor.tileMaterialId,
                    borders: editor.borders,
                    ...area
                });
            }
            else if (tool === "draw-tile-slope-right") {
                editor.addTile({
                    id: generateId(),
                    shape: SHAPES.SLOPE_RIGHT,
                    color: editor.fillColor,
                    stroke: editor.strokeColor,
                    opacity: editor.opacity,
                    transparent: editor.transparent,
                    layer: editor.tileLayer,
                    blocks: editor.tileLayer === LAYERS.BACKGROUND ? false : editor.blocks,
                    materialId: editor.tileMaterialId,
                    borders: editor.borders,
                    ...area
                });
            }
            else if (tool === "draw-tile-sloping-ceiling-left") {
                editor.addTile({
                    id: generateId(),
                    shape: SHAPES.SLOPING_CEILING_LEFT,
                    color: editor.fillColor,
                    stroke: editor.strokeColor,
                    opacity: editor.opacity,
                    transparent: editor.transparent,
                    layer: editor.tileLayer,
                    blocks: editor.tileLayer === LAYERS.BACKGROUND ? false : editor.blocks,
                    materialId: editor.tileMaterialId,
                    borders: editor.borders,
                    ...area
                });
            }
            else if (tool === "draw-tile-sloping-ceiling-right") {
                editor.addTile({
                    id: generateId(),
                    shape: SHAPES.SLOPING_CEILING_RIGHT,
                    color: editor.fillColor,
                    stroke: editor.strokeColor,
                    opacity: editor.opacity,
                    transparent: editor.transparent,
                    layer: editor.tileLayer,
                    blocks: editor.tileLayer === LAYERS.BACKGROUND ? false : editor.blocks,
                    materialId: editor.tileMaterialId,
                    borders: editor.borders,
                    ...area
                });
            }
            else if (tool === "draw-tile-top-down") {
                editor.addTile({
                    id: generateId(),
                    shape: SHAPES.TOP_DOWN,
                    color: editor.fillColor,
                    stroke: editor.strokeColor,
                    opacity: editor.opacity,
                    transparent: editor.transparent,
                    layer: LAYERS.BACKGROUND,
                    blocks: editor.blocks,
                    materialId: editor.tileMaterialId,
                    borders: editor.borders,
                    ...area
                });
            }
            else if (tool === "draw-tile-shading") {
                editor.addTile({
                    id: generateId(),
                    shape: SHAPES.SHADING,
                    color: editor.fillColor,
                    stroke: editor.strokeColor,
                    opacity: editor.opacity,
                    transparent: editor.transparent,
                    layer: editor.tileLayer,
                    blocks: false,
                    materialId: editor.tileMaterialId,
                    borders: editor.borders,
                    ...area
                });
            }
            else if (tool === "draw-sprite-duckface") {
                editor.addSprite({
                    typeId: "duckface",
                    isPlayer: editor.isPlayer,
                    direction: editor.spriteDirection,
                    ...area
                });
            }
            else if (tool === "draw-sprite-egg") {
                editor.addSprite({
                    typeId: "egg",
                    isPlayer: editor.isPlayer,
                    direction: editor.spriteDirection,
                    ...area
                });
            }
            else if (tool === "draw-sprite-pighead") {
                editor.addSprite({
                    typeId: "pighead",
                    isPlayer: editor.isPlayer,
                    direction: editor.spriteDirection,
                    ...area
                });
            }
            else if (tool === "draw-sprite-box") {
                editor.addSprite({
                    typeId: "box",
                    direction: editor.spriteDirection,
                    ...area
                });
            }
            else if (tool === "draw-sprite-living-stone") {
                editor.addSprite({
                    typeId: "living-stone",
                    direction: editor.spriteDirection,
                    ...area
                });
            }
            else if (tool === "draw-sprite-cheeks") {
                editor.addSprite({
                    typeId: "cheeks",
                    direction: editor.spriteDirection,
                    ...area
                });
            }
            else if (tool === "draw-sprite-rabbit") {
                editor.addSprite({
                    typeId: "rabbit",
                    direction: editor.spriteDirection,
                    ...area
                });
            }
            else if (tool === "draw-sprite-torso") {
                editor.addSprite({
                    typeId: "torso",
                    direction: editor.spriteDirection,
                    ...area
                });
            }
            else if (tool === "draw-sprite-ghost") {
                editor.addSprite({
                    typeId: "ghost",
                    direction: editor.spriteDirection,
                    ...area
                });
            }
            else if (tool === "draw-sprite-platform-horizontal") {
                editor.addSprite({
                    typeId: "platform-horizontal",
                    direction: editor.spriteDirection,
                    ...area
                });
            }
            else if (tool === "draw-sprite-platform-vertical") {
                editor.addSprite({
                    typeId: "platform-vertical",
                    direction: editor.spriteDirection,
                    ...area
                });
            }
            else if (tool === "draw-sprite-zombie") {
                editor.addSprite({
                    typeId: "zombie",
                    direction: editor.spriteDirection,
                    ...area
                });
            }
            else if (tool === "draw-sprite-1-eyed-zombie") {
                editor.addSprite({
                    typeId: "1-eyed-zombie",
                    direction: editor.spriteDirection,
                    ...area
                });
            }
            else if (tool === "draw-sprite-spikes-up") {
                editor.addSprite({
                    typeId: "spikes-up",
                    ...area
                });
            }
            else if (tool === "draw-sprite-chill-n-fire") {
                editor.addSprite({
                    typeId: "chill-n-fire",
                    direction: editor.spriteDirection,
                    ...area
                });
            }
            else if (tool === "draw-sprite-pill-mega-placebo") {
                editor.addSprite({
                    typeId: "pill-mega-placebo",
                    direction: editor.spriteDirection,
                    ...area
                });
            }
            else if (tool === "draw-sprite-burger") {
                editor.addSprite({
                    typeId: "burger",
                    ...area
                });
            }
            else if (tool === "draw-sprite-carrot") {
                editor.addSprite({
                    typeId: "carrot",
                    ...area
                });
            }
            else if (tool === "draw-sprite-key") {
                editor.addSprite({
                    typeId: "key",
                    direction: editor.spriteDirection,
                    ...area
                });
            }
            else if (tool === "draw-sprite-eye") {
                editor.addSprite({
                    typeId: "eye",
                    direction: editor.spriteDirection,
                    ...area
                });
            }
            else if (tool === "draw-sprite-lock") {
                editor.addSprite({
                    typeId: "lock",
                    ...area
                });
            }
            else if (tool === "draw-sprite-heart") {
                editor.addSprite({
                    typeId: "heart",
                    direction: editor.spriteDirection,
                    ...area
                });
            }
            else if (tool === "draw-sprite-flying-heart") {
                editor.addSprite({
                    typeId: "flying-heart",
                    direction: editor.spriteDirection,
                    ...area
                });
            }
            else if (tool === "draw-sprite-exit-door") {
                editor.addSprite({
                    typeId: "exit-door",
                    ...area
                });
            }
            else if (tool.startsWith("draw-sprite")) {
                editor.addSprite({
                    typeId: tool.split("draw-sprite-")[1],
                    direction: editor.spriteDirection,
                    ...area
                });
            }
            else if (tool === "select-tiles") {
                editor.selectTiles(scene.tiles.filter(tile =>
                    tile.layer === editor.tileLayer &&
                    tile.x >= area.x && tile.x + tile.width <= area.x + area.width &&
                    tile.y >= area.y && tile.y + tile.height <= area.y + area.height
                ));
            }
            else if (tool === "select-sprites") {
                editor.selectSprites(sprites.filter(sprite =>
                    sprite.x >= area.x && sprite.x + sprite.width <= area.x + area.width &&
                    sprite.y >= area.y && sprite.y + sprite.height <= area.y + area.height
                ));
            }
        }
        else {

            let selectedSprites = sprites.filter(sprite =>
                sprite.x + sprite.width >= area.x && sprite.x <= area.x + area.width &&
                sprite.y + sprite.height >= area.y && sprite.y <= area.y + area.height
            );

            let selectedTiles = scene.tiles.filter(tile =>
                tile.x <= area.x && tile.x + tile.width >= area.x + area.width &&
                tile.y <= area.y && tile.y + tile.height >= area.y + area.height
            );

            selectedTiles = selectedTiles.sort((t1, t2) => t1.layer - t2.layer);

            if (selectedSprites.length > 0) {
                editor.selectSprites([selectedSprites[selectedSprites.length - 1]]);
            }
            else if (selectedTiles.length > 0) {
                editor.selectTiles([
                    selectedTiles[selectedTiles.length - 1]
                ]);
            }
            else if (tool === "draw-sprite-pill-plus") {
                editor.addSprite({
                    typeId: "pill-plus",
                    x: area.x,
                    y: area.y,
                    width: 16,
                    height: 16
                });
            }
            else if (tool === "draw-sprite-pill-minus") {
                editor.addSprite({
                    typeId: "pill-minus",
                    x: area.x,
                    y: area.y,
                    width: 16,
                    height: 16
                });
            }
            else if (tool === "draw-sprite-pill-placebo") {
                editor.addSprite({
                    typeId: "pill-placebo",
                    x: area.x,
                    y: area.y,
                    width: 16,
                    height: 16
                });
            }
            else if (tool === "draw-sprite-pill-speed") {
                editor.addSprite({
                    typeId: "pill-speed",
                    x: area.x,
                    y: area.y,
                    width: 16,
                    height: 16
                });
            }
            else if (tool === "draw-sprite-chili") {
                editor.addSprite({
                    typeId: "chili",
                    x: area.x,
                    y: area.y,
                    width: 16,
                    height: 16
                });
            }
        }
    }

    if (message !== null) {
        worker.postMessage(message);
    }

    controls.mouseLeft = false;
    controls.mouseRight = false;
    editor.dragMode = undefined;
    editor.resizeDirection = undefined;

    document.getElementById("source").value = JSON.stringify(scene, null, ' ');
};

/*
function selectTiles(tiles = []) {
    editor.idsOfSelectedTiles = tiles.map(tile => tile.id);
    if (tiles.length === 1) {
        document.getElementById("tile-borders-top").checked = tiles[0].borders.t;
        document.getElementById("tile-borders-right").checked = tiles[0].borders.r;
        document.getElementById("tile-borders-bottom").checked = tiles[0].borders.b;
        document.getElementById("tile-borders-left").checked = tiles[0].borders.l;
        document.getElementById("color").value = tiles[0].color;
        document.getElementById("width").value = tiles[0].width;
        document.getElementById("height").value = tiles[0].height;
        document.getElementById("x").value = tiles[0].x;
        document.getElementById("y").value = tiles[0].y;
    }
};
*/
/*
function selectSprites(sprites = []) {
    editor.idsOfSelectedSprites = sprites.map(sprite => sprite.id);
};
*/

const onEditorKeydownListener = event => {

    if (hasInputFocus()) {
        return;
    }

    if (!mode.pause) {
        onGameKeydownListener(event);
    }
    else if (!camera.enabled) {
        if (event.code === 'ArrowLeft') {
            camera.x -= editor.grid.width * 3;
        }
        if (event.code === 'ArrowRight') {
            camera.x += editor.grid.width * 3;
        }
        if (event.code === 'ArrowUp') {
            camera.y -= editor.grid.height * 3;
        }
        if (event.code === 'ArrowDown') {
            camera.y += editor.grid.height * 3;
        }
    }

    if (event.code === 'KeyP') {
        worker.postMessage({ action: mode.pause ? "PAUSE_OFF" : "PAUSE_ON" });
    }

    if (event.code === 'KeyR') {
        if (editor.idsOfSelectedSprites.length === 0) {
            resetScene();
            //editor.resetCamera();
        }
        else {
            worker.postMessage({
                action: "UPDATE",
                sprites: editor.idsOfSelectedSprites.map(id => scene.sprites.find(sprite => sprite.id === id))
            });
        }
    }
    if (event.code === 'KeyN') {
        scene = new Scene({
            tiles: [],
            sprites: []
        });
        editor.idsOfSelectedSprites = [];
        editor.idsOfSelectedTiles = [];
        worker.postMessage({ action: "SET_SCENE", scene });
    }

    event.preventDefault();
    event.stopPropagation();
    tileLayers.update = true;
};

const onEditorKeyupListener = event => {

    if (hasInputFocus()) {
        return;
    }

    if (!mode.pause) {
        onGameKeyupListener(event);
    }

    if (event.code === 'Backspace' || event.code === 'Delete') {
        editor.removeSelected();
    }
    else if (event.code === 'KeyU') {
        editor.undo();
        worker.postMessage({ action: "SET_SCENE", scene });
    }
    else if (event.code === 'KeyL') {
        editor.idsOfSelectedSprites
            .map(id => sprites.find(sprite => sprite.id === id))
            .forEach(sprite => console.dir(sprite));
    }
    else if (event.code === 'KeyJ') {
        editor.toggleSource();
    }

    event.preventDefault();
    event.stopPropagation();
    tileLayers.update = true;
};

function onEditorTouchStart(event) {
    /*
    evt.preventDefault();
    evt.changedTouches.forEach(touch => {
        controls.touches.push({...touch});
    });*/
    console.log(event);
}

function onEditorTouchMove(event) {
    /*
    evt.preventDefault();
    evt.changedTouches.forEach(touch => {
        controls.touches.push({...touch});
    });*/
    console.log(event);
}

function onEditorTouchCancel(event) {
    /*
    evt.preventDefault();
    evt.changedTouches.forEach(touch => {
        controls.touches.push({...touch});
    });*/
    console.log(event);
}

function onEditorTouchEnd(event) {
    /*
    evt.preventDefault();
    evt.changedTouches.forEach(touch => {
        controls.touches.push({...touch});
    });*/
    console.log(event);
}

const initEditor = async ({ sceneId, albumId, url }) => {
    init({ width: window.innerWidth - 8, height: window.innerHeight - 4 });

    jitters = false;
    audio.musicEnabled = false;

    canvas.addEventListener("mousedown", onMouseDownListener, false);
    document.addEventListener("mousemove", onMouseMoveListener, false);
    document.addEventListener("mouseup", onMouseUpListener, false);

    document.addEventListener("keydown", onEditorKeydownListener, false);
    document.addEventListener("keyup", onEditorKeyupListener, false);

    //jitters = false;
    /*
    canvas.addEventListener("touchstart", onEditorTouchStart, false);
    canvas.addEventListener("touchend", onEditorTouchEnd, false);
    canvas.addEventListener("touchcancel", onEditorTouchCancel, false);
    canvas.addEventListener("touchmove", onEditorTouchMove, false);
    */

    canvas.oncontextmenu = function (e) {
        e.preventDefault();
    };

    gameState.init(STATES.PLAY);

    worker.postMessage({ action: "DISABLE_OPTIMIZATIONS" });

    if (sceneId) {
        await editor.loadScene({ sceneId, albumId, url });
        worker.postMessage({ action: "PAUSE_ON" });
    }
    else {
        scene = new Scene({});
        worker.postMessage({
            action: "SET_SCENE",
            scene,
            spriteTypes
        });
    }

    /*
    if (document.getElementById("scene-json")) {
        document.getElementById("scene-json").value = JSON.stringify(scene, null, ' ');
    }
    if (document.getElementById("bg-color")) {
        document.getElementById("bg-color").value = scene.bgColor;
    }
    */
    window.onresize = () => {
        init({ width: window.innerWidth, height: window.innerHeight });
    };

    camera.enabled = false;

    audio.init();

    requestAnimationFrame(mainloop);

    editor.updateUI();

    //editor.updateUI();
}

async function saveScene({ albumId }) {
    scene.lastEdit = new Date().toISOString();
    const res = await fetch(`/album/${albumId}/scenes/${scene.id}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(scene)
    });
    if (res.ok) {
        alert("Scene saved");
    }
    else {
        alert("Saving scene failed. Saving only works locally when the server is in dev mode.");
    }
}
