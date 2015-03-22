"use strict";

var phaserStorage = require("../utilities/phaser-storage");

// Wrapping the callback into a anon function so that the phaserStorage.game object is properly in place  - magic!
var preload = () => () => require("./preload")();
var create  = () => () => require("./create")();
var update  = () => () => require("./update")();
var render  = () => () => require("./render")();

/**
 * The game module itself that manages the whole game as one.
 * @module game
 */
var game = {
    /**
     * Initializes the engine and starts the game
     * @return {[type]} [description]
     */
    start: () => {
        phaserStorage.game = new Phaser.Game(
            450,
            700,
            Phaser.CANVAS,
            "FIce",
            {
                preload: preload(),
                create: create(),
                update: update(),
                render: render()
            }
        );
    }
};

module.exports = game;