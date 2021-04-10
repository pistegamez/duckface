'use strict';

const AudioContext = window.AudioContext || window.webkitAudioContext;

const themes = {
    "theme-duckbeat": {
        title: "Duckbeat",
        authors: "Janne Kivilahti"
    },
    "theme-duckfunk": {
        title: "Duckfunk",
        authors: "FX Ducks"
    },
    "theme-horror-3": {
        title: "Ducks 'n Goblins",
        authors: "Janne Kivilahti"
    },
    "theme-enigma": {
        title: "Enigma",
        authors: "Janne Kivilahti"
    },
    "theme-fat-and-blue-pt-1": {
        title: "Fat and Blue (Part 1)",
        authors: "Crudelis Diabolus"
    },
    "theme-fat-and-blue-pt-2": {
        title: "Fat and Blue (Part 2)",
        authors: "Crudelis Diabolus"
    },
    "theme-jollypop": {
        title: "Jollypop",
        authors: "Janne Kivilahti"
    },
    "theme-kotomon": {
        title: "Kotomon",
        authors: "Janne Kivilahti"
    },
    "theme-kyarhem-1": {
        title: "Kuoleman jalkeiset liikamaksut (excerpt)",
        authors: "Kyarhem"
    },
    "theme-slow-dungeon": {
        title: "Last Dungeon",
        authors: "Janne Kivilahti"
    },
    "theme-country": {
        title: "No Country for Old Squares",
        authors: "FX Ducks"
    },
    "theme-nostalgia": {
        title: "Nostalgia",
        authors: "Janne Kivilahti"
    },
    "theme-secret-agent": {
        title: "Not So Secret Agents",
        authors: "Janne Kivilahti"
    },
    "theme-horror-1": {
        title: "Oh, Horror",
        authors: "Janne Kivilahti"
    },
    "theme-kazoo": {
        title: "Please Wait and Listen to Kazoo",
        authors: "FX Ducks"
    },
    "theme-trance": {
        title: "Power Up",
        authors: "Janne Kivilahti"
    },
    "theme-punk-1": {
        title: "Punk 1",
        authors: "Awful Squares"
    },
    "theme-punk-1-orchestal": {
        title: "Punk 1 (orchestral)",
        authors: "Janne Kivilahti"
    },
    "theme-punk-2": {
        title: "Punk 2",
        authors: "Awful Squares"
    },
    "theme-riddles": {
        title: "Riddles",
        authors: "Janne Kivilahti"
    },
    "theme-summer-funk": {
        title: "Summer Funk",
        authors: "Janne Kivilahti"
    },
    "theme-duckblues": {
        title: "Super Duck Bros",
        authors: "FX Ducks"
    },
    "theme-horror-2": {
        title: "There Are No Ghosts",
        authors: "Janne Kivilahti"
    },
};

const audio = {
    context: undefined,
    sfxBuffer: undefined,
    musicBuffer: undefined,
    song: undefined,
    musicPlaying: false,
    effectsEnabled: true,
    musicEnabled: true,
    effects: {
        jump: {
            offset: 0,
            length: 1,
            randomize: true
        },
        bump: {
            offset: 1,
            length: 1,
            randomize: true
        },
        collect: {
            offset: 2,
            length: 1,
            randomize: false
        },
        "transform-up": {
            offset: 3,
            length: 1,
            randomize: false
        },
        "transform-down": {
            offset: 4,
            length: 1,
            randomize: false
        },
        fail: {
            offset: 5,
            length: 1,
            randomize: false
        },
        alert: {
            offset: 6,
            length: 1,
            randomize: true
        },
        fanfare: {
            offset: 7,
            length: 1,
            randomize: false
        },
        fire: {
            offset: 8,
            length: 1,
            randomize: true
        },
        damage: {
            offset: 9,
            length: 1,
            randomize: true
        },
        pop: {
            offset: 10,
            length: 1,
            randomize: true
        }
    },

    async init({ volume = 0.5 } = {}) {
        this.context = new AudioContext();
        this.gainNode = this.context.createGain();
        this.gainNode.gain.value = volume;
        this.gainNode.connect(this.context.destination);
        this.loadAudio("/audio/sfx.mp3", (buffer) => {
            this.sfxBuffer = buffer;
        });
    },

    resume() {
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
        return this.context.state !== 'suspended';
    },

    enableEffects() {
        this.resume();
        this.effectsEnabled = true;
    },

    disableEffects() {
        this.effectsEnabled = false;
    },

    enableMusic() {
        this.musicEnabled = true;
        this.startMusic();
    },

    disableMusic() {
        this.musicEnabled = false;
        this.pauseMusic();
    },

    pauseMusic() {
        this.stopMusic();
    },

    setVolume(volume) {
        this.gainNode.gain.value = volume;
    },

    async playSound({
        sound,
        volume = 1.0,
        x = camera.x + canvas.width / 2,
        y = camera.y + canvas.height / 2,
    }) {
        if (this.effectsEnabled && this.resume()) {
            const effect = this.effects[sound];
            if (effect === undefined) {
                console.error(`could not play sound ${sound}`);
                return;
            }

            if (x > camera.x - 25 && x < camera.x + canvas.width + 25 && y > camera.y - 25 && y < camera.y + canvas.height + 25) {

                if (!effect.lastPlayed) {
                    effect.lastPlayed = Date.now();
                }
                else {
                    if (Date.now() - effect.lastPlayed < 50) {
                        return;
                    }
                    effect.lastPlayed = Date.now();
                }

                const pan = Math.min(1, Math.max(-1, ((x - camera.x + canvas.width / 2) - canvas.width) / canvas.width) * 1.5);

                const source = this.createSourceNode(this.sfxBuffer, volume, pan);
                const rate = effect.randomize ? 1.0 + Math.random() / 10 : 1;
                source.playbackRate.value = rate;
                source.start(Math.random() / 100, effect.offset);
                source.stop(this.context.currentTime + effect.length / rate);
            }
        }
    },

    async loadMusic(song) {
        //console.log("loadMusic " + song);
        if (this.musicEnabled) {
            if (song !== undefined && song !== this.song) {
                this.loadAudio(`/audio/${song}.mp3`, (buffer) => {
                    this.musicBuffer = buffer;
                    if (this.musicSource) {
                        this.musicSource.stop(this.context.currentTime);
                        this.musicPlaying = false;
                    }
                    this.startMusic();
                });
                this.song = song;
            }
            else {
                this.startMusic();
            }
        }
    },

    async startMusic() {
        //console.log("startMusic");
        if (!this.musicBuffer) {
            console.log("Could not start music, because buffer is not loaded (yet).");
            return;
        }

        if (this.resume() && !this.musicPlaying) {
            this.musicSource = this.createSourceNode(this.musicBuffer, 1.0);
            this.musicSource.loop = true;
            this.musicSource.loopStart = 0;
            this.musicSource.start(0, 0);
            this.musicPlaying = true;
        }
    },

    async stopMusic() {
        if (this.musicPlaying) {
            this.musicSource.stop(this.context.currentTime);
            this.musicPlaying = false;
        }
    },

    async loadAudio(filePath, success) {
        //console.log("loadAudio" + filePath);
        const response = await fetch(filePath);
        const arrayBuffer = await response.arrayBuffer();
        this.context.decodeAudioData(
            arrayBuffer,
            success,
            (error) => {
                console.log(error);
            }
        );
    },

    createSourceNode(audioBuffer, volume = 1.0, pan = 0) {
        //console.log("createSourceNode");
        const sourceNode = this.context.createBufferSource();
        const gainNode = this.context.createGain();
        let pannerNode;

        if (this.context.createStereoPanner) {
            pannerNode = this.context.createStereoPanner();
            pannerNode.pan.setValueAtTime(pan, this.context.currentTime);
        }
        else {
            pannerNode = this.context.createPanner();
            pannerNode.panningModel = 'equalpower';
            pannerNode.setPosition(pan, 0, 1 - Math.abs(pan));
        }

        gainNode.gain.value = volume;
        sourceNode.buffer = audioBuffer;
        sourceNode.connect(gainNode);
        gainNode.connect(pannerNode);
        pannerNode.connect(this.gainNode);
        return sourceNode;
    }
}