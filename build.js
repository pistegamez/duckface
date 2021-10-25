// https://github.com/srod/node-minify/tree/master

const fs = require("fs");
const minify = require("@node-minify/core");
const uglifyES = require("@node-minify/uglify-es");
const jsonminify = require("@node-minify/jsonminify");
const htmlMinifier = require("@node-minify/html-minifier");

const hash = generateHash();
const GAME_BUNDLE_FILE = `bundle-${hash}.js`;
const EDITOR_BUNDLE_FILE = `editor-bundle-${hash}.js`;
const WORKER_FILE = `worker-${hash}.js`;
const WORKER_BUNDLE_FILE = `worker-bundle-${hash}.js`;

console.log("======= Building DUCKFACE ========");

console.log("Deleting ./build/js/*");

fs.readdirSync("./build/js").forEach((file) => {
  fs.unlinkSync("./build/js/" + file);
});

fs.readdirSync("./build/albums").forEach((album) => {
  if (album === "albums.json") {
    console.log(`Deleting ./build/albums/${album}`);
    fs.unlinkSync(`./build/albums/${album}`);
  } else {
    console.log(`Deleting ./build/albums/${album}/*`);
    fs.readdirSync(`./build/albums/${album}/scenes`).forEach((scene) => {
      fs.unlinkSync(`./build/albums/${album}/scenes/${scene}`);
    });
    fs.readdirSync(`./build/albums/${album}`).forEach((file) => {
      if (file.indexOf(".") !== -1) {
        console.log(`Deleting ./build/albums/${album}/${file}`);
        fs.unlinkSync(`./build/albums/${album}/${file}`);
      }
    });
  }
  //fs.unlinkSync(`./build/albums/${album}`);
});
/*
fs.readdirSync("./build/scenes").forEach(file => {
  fs.unlinkSync("./build/scenes/" + file);
});*/

console.log("Deleting ./build/audio/*");

fs.readdirSync("./build/audio").forEach((file) => {
  fs.unlinkSync("./build/audio/" + file);
});

console.log("Copying assets from ./public -> ./build/");

// Copy root folder files that do not need processing
fs.readdirSync("./public").forEach((file) => {
  if (
    file !== "game.html" &&
    file !== "editor.html" &&
    file !== "audio" &&
    file !== "js" &&
    file !== "sprite-types" &&
    file !== ".DS_Store" &&
    file !== "albums"
  ) {
    copyFile("./public/" + file, "./build/" + file);
  }
});

// Copy audio files
fs.readdirSync("./public/audio").forEach((file) => {
  copyFile("./public/audio/" + file, "./build/audio/" + file);
});

// Copy albums.json
copyFile("./public/albums/albums.json", "./build/albums/albums.json");

// copy albums
fs.readdirSync("./public/albums").forEach((albumDir) => {
  if (albumDir !== "albums.json") {
    copyFile(
      `./public/albums/${albumDir}/album.json`,
      `./build/albums/${albumDir}/album.json`
    );
    fs.readdirSync(`./public/albums/${albumDir}/scenes`).forEach((scene) => {
      minimizeJSONFile(
        `./public/albums/${albumDir}/scenes/${scene}`,
        `./build/albums/${albumDir}/scenes/${scene}`
      );
    });
  }
});

// Copy and minimize scenes
/*
fs.readdirSync("./public/scenes").forEach(file => {
  minimizeJSONFile("./public/scenes/" + file, "./build/scenes/" + file);
});
*/
// Create a minimized bundle for game.html
createGameBundle();

// Create a minimized bundle for worker.js
createWorkerBundle();

// Create a minimized bundle for editor.html
createEditorBundle();

function createGameBundle() {
  createBundle(
    [
      "./public/js/common.js",
      ...fs
        .readdirSync("./public/sprite-types")
        .map((file) => "./public/sprite-types/" + file),
      "./public/js/particleTypes.js",
      "./public/js/game.js",
      "./public/js/draw.js",
      "./public/js/sound.js",
    ],
    `./build/js/${GAME_BUNDLE_FILE}`
  );
}

function createWorkerBundle() {
  createBundle(
    ["./public/js/common.js", "./public/js/behaviours.js"],
    `./build/js/${WORKER_BUNDLE_FILE}`
  );
}

function createEditorBundle() {
  createBundle(
    [
      "./public/js/common.js",
      ...fs
        .readdirSync("./public/sprite-types")
        .map((file) => "./public/sprite-types/" + file),
      "./public/js/particleTypes.js",
      "./public/js/game.js",
      "./public/js/editor.js",
      "./public/js/draw.js",
      "./public/js/sound.js",
    ],
    `./build/js/${EDITOR_BUNDLE_FILE}`
  );
}

// copy game.html and replace script-tags with bundle
fs.readFile("./public/game.html", "utf8", function (err, data) {
  if (err) {
    return console.log(err);
  }

  let scriptsStart = data.indexOf("<!-- scripts-start -->");
  let scriptsEnd = data.indexOf("<!-- scripts-end -->");
  let result =
    data.slice(0, scriptsStart) +
    `<script src="js/${GAME_BUNDLE_FILE}"></script>` +
    data.slice(scriptsEnd + 21);
  result = result.replace("worker.js", WORKER_FILE);

  minify({
    compressor: htmlMinifier,
    content: result,
    callback: function (err, min) {
      //console.log(`created ${dest}`);

      if (err) {
        console.error(err);
      }

      fs.writeFile("./build/game.html", min, "utf8", function (err) {
        if (err) return console.log(err);
        console.log("game.html modified");
      });
    },
  });
  /*
  fs.writeFile('./build/game.html', result, 'utf8', function (err) {
    if (err) return console.log(err);
    console.log('game.html modified');
  });
*/
});

// copy editor.html and replace script-tags with bundle
fs.readFile("./public/editor.html", "utf8", function (err, data) {
  if (err) {
    return console.log(err);
  }

  let scriptsStart = data.indexOf("<!-- scripts-start -->");
  let scriptsEnd = data.indexOf("<!-- scripts-end -->");
  let result =
    data.slice(0, scriptsStart) +
    `<script src="js/${EDITOR_BUNDLE_FILE}"></script>` +
    data.slice(scriptsEnd + 21);
  result = result.replace("worker.js", WORKER_FILE);

  fs.writeFile("./build/editor.html", result, "utf8", function (err) {
    if (err) return console.log(err);
    console.log("editor.html modified");
  });
});

// copy and minimize worker.js and replace script-imports with bundle
fs.readFile("./public/js/worker.js", "utf8", function (err, data) {
  if (err) {
    return console.log(err);
  }

  let scriptsStart = data.indexOf("// scripts-start");
  let scriptsEnd = data.indexOf("// scripts-end");
  let result =
    data.slice(0, scriptsStart) +
    `importScripts('/js/${WORKER_BUNDLE_FILE}');` +
    data.slice(scriptsEnd + 14);

  minify({
    compressor: uglifyES,
    content: result,
    callback: function (err, min) {
      //console.log(`created ${dest}`);

      if (err) {
        console.error(err);
      }
      if (min) {
        //console.log(min.length);
      }

      fs.writeFile(`./build/js/${WORKER_FILE}`, min, "utf8", function (err) {
        if (err) return console.log(err);
        console.log("worker.js modified");
      });
    },
  });
});

createBuildInfo();

function copyFile(src, dest) {
  fs.readFile(src, function (err, data) {
    console.log(`${src} -> ${dest}`);

    if (err) {
      return console.error(err);
    }

    fs.writeFile(dest, data, function (err) {
      if (err) return console.log(err);
    });
  });
}

function createBundle(files, dest) {
  console.log(`Bundling files [${files.join(", ")}] => ${dest}`);
  minify({
    compressor: uglifyES,
    input: files,
    output: dest,
    callback: function (err, min) {
      console.log(`created ${dest}`);

      if (err) {
        console.error(err);
      }
      if (min) {
        //console.log(min.length);
      }
    },
  });
}

function minimizeJSONFile(src, dest) {
  fs.readFile(src, "utf8", function (err, data) {
    if (err) {
      console.log(`${src} -> ${dest}`);
      return console.error(err);
    }

    console.log(`minify ${src} -> ${dest}`);

    minify({
      compressor: jsonminify,
      content: data,
      callback: function (err, min) {
        if (err) {
          console.log(`${src} -> ${dest}`);
          console.error(err);
        }

        fs.writeFile(dest, min, function (err) {
          if (err) {
            console.log(`${src} -> ${dest}`);
            return console.log(err);
          }
          console.log(`created ${dest}`);
        });
      },
    });
  });
}

function createBuildInfo() {
  const info = {
    hash,
    date: new Date().toISOString(),
  };
  fs.writeFile(
    `./build/build-info.json`,
    JSON.stringify(info),
    "utf8",
    function (err) {
      if (err) return console.log(err);
      console.log("build-info.json created");
    }
  );
}

function generateHash() {
  return "xxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
