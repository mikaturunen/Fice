"use strict";

var phaserStorage = require("../utilities/phaser-storage");

var preload = () => {
    console.log("Preload in place.");

    // Load all associated sprite sheets
    
    phaserStorage.game.load.spritesheet("player", "/assets/images/player-sheet.png");
};

module.exports = preload;