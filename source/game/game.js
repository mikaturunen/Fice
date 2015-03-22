"use strict";

var phaserStorage = require("../utilities/phaser-storage");

// Wrapping the callback into a anon function so that the phaserStorage.game object is properly in place  - magic!
var preload = () => () => require("./preload")(phaserStorage.game);
var create  = () => () => require("./create")(phaserStorage.game);
var update  = () => () => require("./update")(phaserStorage.game);
var render  = () => () => require("./render")(phaserStorage.game);

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
            Phaser.AUTO,
            "FIce",
            {
                preload: preload(),
                create: create(),
                update: update(),
                render: render()
            }
        );

        phaserStorage.game = gameObject;
    }
};

module.exports = game;