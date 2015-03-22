"use strict";

var phaserStorage = require("../utilities/phaser-storage");
var game = phaserStorage.game;
var player = require("../entities/player");

/**
 * Create function for Phaser.
 * @return {Function} Function that can be called to execute the actual create functionality for Phaser.
 */
var create = (game) => {
    // Loading player sprite
    player.sprite = game.add.sprite(
            game,                 // current game object
            game.width / 2,       // X 
            10,                   // Y
            "player",             // Sprite / sheet name
            5                     // frame
        );

    var sprites = [
        player.sprite
    ];

    // Giving all the loaded sprite objects arcade physics
    game.physics.arcade.enable(sprites);
    // I want to be able to tinker with physics on the fly so I'm tying them into a separate variable.
    game.physics.arcade.y = phaserStorage.gravity;
    // Set common physics base for all objects that need it
    sprites.forEach(s => {
        s.body.collideWorldBounds = true
    });
};

console.log("Create in place.");
module.exports = create;