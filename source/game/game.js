"use strict";

var phaserStorage = require("../utilities/phaser-storage");

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
                preload: require("./preload")(),
                create: require("./create")(),
                update: require("./update")(),
                render: require("./render")()
            }
        );
    }
};

module.exports = game;