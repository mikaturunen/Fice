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

    // Loading player sprite
    player.sprite = game.add.sprite(
            game.width / 2,       // X 
            10,                   // Y
            "player",             // Sprite / sheet name
            0                     // frame
        );

    // Giving all the loaded sprite objects arcade physics
    game.physics.arcade.enable(player.sprite);
    // I want to be able to tinker with physics on the fly so I'm tying them into a separate variable.
    game.physics.arcade.gravity.y = phaserStorage.gravity;
    // Set common physics base for all objects that need it
    player.sprite.body.collideWorldBounds = true;


};

console.log("Create in place.");
module.exports = create;