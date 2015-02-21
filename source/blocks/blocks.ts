"use strict";

import utilities = require("../utilities/utilities");

module blocks {
    export var sprites: Phaser.Group;

    /** @type {string} Current position. */
    var currentPosition: Phaser.point = new Phaser.Point(0, 0);

    /** @type {string} Position we are moving towards. */
    var nextPosition: Phaser.point = new Phaser.Point(0, 0);

    export function init(game: Phaser.Game) {
        blocks.sprites = game.add.group();
        utilities.fillSpriteGroup(blockGroup, "BLOCK", "entities", 0, game);
    }
}

export = blocks;
