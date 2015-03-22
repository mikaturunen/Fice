"use strict";

var phaserStorage = require("../utilities/phaser-storage");

var preload = (game) => {
    // Load all associated sprite sheets
    game.load.spritesheet("player", "/assets/images/player-sheet.png");
};

console.log("Preload in place.");
module.exports = preload;