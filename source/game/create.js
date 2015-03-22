"use strict";

var phaserStorage = require("../utilities/phaser-storage");
var player = require("../entities/player");

/**
 * Create function for Phaser.
 * @return {Function} Function that can be called to execute the actual create functionality for Phaser.
 */
var create = () => {
    console.log("Create in place.");

    // Loading player sprite
    player.sprite = game.add.sprite(
            phaserStorage.game,                 // current game object
            phaserStorage.game.width / 2,       // X 
            10,                                 // Y
            "player",                           // Sprite / sheet name
            5                                   // frame
        );
    
};

module.exports = create;