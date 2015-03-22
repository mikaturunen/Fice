"use strict";

var phaserStorage = require("../utilities/phaser-storage");

var playerVelocity = 55;

// Creating cursos keys from Phaser
var keys = {
    cursors: phaserStorage.game.input.keyboard.createCursorKeys(),
    jump: phaserStorage.game.input.keyboard.addKey(Phaser.Keyboard.A),
    shoot: phaserStorage.game.input.keyboard.addKey(Phaser.Keyboard.S)
};

var update = () => {
    checkInputs();
};

var checkInputs = () => {
    if (keys.cursors.left.isDown) {
        player.sprite.body.velocity = -playerVelocity;
    } else if (keys.cursors.right.isDown) {
        player.sprite.body.velocity = playerVelocity;
    }

    if (keys.jump && player.sprite.body.velociy <= 0) {
        player.sprite.body.velocity.y = 300;
    }
};

/**
 * Player entity
 */
var player = {
    /**
     * Player Sprite object.
     * @type {Phaser.Sprite}
     */
    sprite: undefined,

    /**
     * Update handler for Player
     */
    update: update
};

module.exports = player;