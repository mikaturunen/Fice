"use strict";

var phaserStorage = require("../utilities/phaser-storage");

/**
 * Create function for Phaser.a
 * @return {Function} Function that can be called to execute the actual create functionality for Phaser.
 */
var create = () => {
    var game = phaserStorage.game;
    // Start the physics system in Phaser, especially with the ARCADE settings
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Loading the player
    var player = require("../entities/player");
    player.create();
};

console.log("Create in place.");
module.exports = create;