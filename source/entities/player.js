"use strict";

var phaserStorage = require("../utilities/phaser-storage");

var playerVelocity = 200;

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
    player.sprite.body.velocity.x = 0;

    if (keys.cursors.left.isDown) {
        player.sprite.body.velocity.x = -playerVelocity;
    } else if (keys.cursors.right.isDown) {
        player.sprite.body.velocity.x = playerVelocity;
    }

    if (keys.jump.isDown && player.sprite.body.velocity.y >= 0) {
        player.sprite.body.velocity.y = -500;
    } else if (!keys.jump.isDown && player.sprite.body.velocity.y < -1) {
        player.sprite.body.velocity.y = 0;
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