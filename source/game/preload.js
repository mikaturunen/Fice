"use strict";

var phaserStorage = require("../utilities/phaser-storage");

var preload = () => {
    // Load all associated sprite sheets
    phaserStorage.game.load.spritesheet("player", "/assets/images/player-sheet.png", 32, 32);

    console.log("Loaded all assets into Phaser.");
};

console.log("Preload in place.");
module.exports = preload;