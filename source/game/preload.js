"use strict";

var phaserStorage = require("../utilities/phaser-storage");

var preload = () => {
    // Load all associated sprite sheets
    phaserStorage.game.load.spritesheet("player", "assets/images/player-sheet.png");
};

console.log("Preload in place.");
module.exports = preload;