"use strict";

import utilities = require("../utilities/utilities");

/**
 * @module fire
 * Fire entity module.
 */
module fire {
    export var sprites: Phaser.Group;

    /** @type {string} Current position. */
    var currentPosition: Phaser.Point = new Phaser.Point(0, 0);

    /** @type {string} Position we are moving towards. */
    var nextPosition: Phaser.Point = new Phaser.Point(0, 0);

    export function init(game: Phaser.Game) {
        fire.sprites = game.add.group();
        utilities.fillSpriteGroup(fire.sprites, "TARGET", "entities", 3, game);
    }
}

export = fire;
