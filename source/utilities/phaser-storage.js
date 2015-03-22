"use strict";

/**
 * Stores many of the common functionality used by Phaser, such as the Game object.
 * Phasers implementation assumes the formal client-side JavaScript approach and I'm working with the node style 
 * of module format here and I don't want to pollute the clients global JS namespace.
 * 
 * @module PhaserStorage
 */
var phaserStorage = {
    /** {Phaser.Game} Phasers game object stored in common place were all that need to use it can easily access it */
    game: undefined,

    gravity: 200
};

module.exports = phaserStorage;