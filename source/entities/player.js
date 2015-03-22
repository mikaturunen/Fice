"use strict";

var phaserStorage = require("../utilities/phaser-storage");

var playerVelocity = 200;

// Creating cursos keys from Phaser
var keys = {
    cursors: phaserStorage.game.input.keyboard.createCursorKeys(),
    jump: phaserStorage.game.input.keyboard.addKey(Phaser.Keyboard.A),
    shoot: phaserStorage.game.input.keyboard.addKey(Phaser.Keyboard.S)
};

var player = () => {
    var game = phaserStorage.game;

    // Loading player sprite
    player.sprite = game.add.sprite(
            game.width / 2,       // X 
            10,                   // Y
            "player",             // Sprite / sheet name
            0                     // frame
        );

    // Giving all the loaded sprite objects arcade physics
    game.physics.arcade.enable(player.sprite);
    player.sprite.body.gravity.y = 1000;
    player.sprite.body.maxVelocity.y = 400;
    player.sprite.body.collideWorldBounds = true;

    createAnimations();
};

/**
 * Creates all the animations from the player sprite sheet for player movement.
 */
var createAnimations = () => {
    // Left direction 
    player.sprite.animations.add("leftWalking", [0, 1, 2, 3], 10, true);
    player.sprite.animations.add("leftJumping", [], 10, true);
    player.sprite.animations.add("leftIdle", [], 10, true);
    player.sprite.animations.add("leftFalling", [], 10, true);

    // Right direction
    player.sprite.animations.add("rightWalking", [5, 6, 7, 8], 10, true);
    player.sprite.animations.add("rightJumping", [], 10, true);
    player.sprite.animations.add("rightIdle", [], 10, true);
    player.sprite.animations.add("rightFalling", [], 10, true);
};

var update = () => {
    checkInputs();
    setAnimations();
};

/**
 * Goes through the defined user inputs and manipulates the player velocity.
 */
var checkInputs = () => {
    player.sprite.body.velocity.x = 0;

    if (keys.cursors.left.isDown) {
        player.facing = "left";
        player.sprite.body.velocity.x = -playerVelocity;
    } else if (keys.cursors.right.isDown) {
        player.facing = "right";
        player.sprite.body.velocity.x = playerVelocity;
    }

    if (keys.jump.isDown && player.sprite.body.velocity.y >= 0) {
        player.sprite.body.velocity.y = -500;
    } else if (!keys.jump.isDown && player.sprite.body.velocity.y < -1) {
        player.sprite.body.velocity.y = 0;
    }
};

/**
 * Sets the player into a N animation series.
 */
var setAnimations() => {
    trySettingAnimationJumping();
    trySettingAnimationFalling();
    trySettingAnimationWalkingLeft();
    trySettingAnimationWalkingRight();
};

var trySettingAnimationJumping = () => {
    if (player.sprite.body.velocity.y < 0) {
        // Jumping
    }
};

var trySettingAnimationFalling = () => {
    if (player.sprite.body.velocity.y > 0) {
        // Falling
    }
};

var trySettingAnimationWalkingLeft = () => {
    if (player.sprite.body.velocity.y === 0 && player.sprite.body.velocity.x < 0) {
        // Walking left
        
    }
};

var trySettingAnimationWalkingRight = () => {

};

var trySettingAnimationStanding = () => {

}:

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
     * What direction the player is facing currently.
     */
    facing: "right",

    /**
     * Creates the player entity.
     */
    create: create,

    /**
     * Update handler for Player
     */
    update: update
};

module.exports = player;