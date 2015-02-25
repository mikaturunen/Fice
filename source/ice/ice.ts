"use strict";

import utilities = require("../utilities/utilities");
import gravity = require("../physics/gravity");

/** @type {string} Current position. */
var currentPosition: Phaser.Point = new Phaser.Point(0, 0);

/** @type {string} Position we are moving towards. */
var nextPosition: Phaser.Point = new Phaser.Point(0, 0);

/**
 * @mobule ice
 * ice module.
 */
module ice {
    export var sprites: Phaser.Group;

    /**
     * Initializes the ice sprites into the game. Populates ice.sprites.
     * @param {Phaser.Game} game Game object from Phaser.
     */
    export function init(game: Phaser.Game) {
        sprites = game.add.group();
        utilities.fillSpriteGroup(ice.sprites, "BLOCK", "entities", 0, game);
    }

    /**
     * Updates ice sprites and their behari
     * @param {Phaser.Game} game Game object from Phaser.
     */
    export function update(game: Phaser.Game) {
        sprites.children.forEach((ice: Phaser.Sprite) => {
            if (gravity.checkCanSpriteStartFalling(ice)) {
                ice.body.velocity.x = 0;
            }
        });
    }
}

export = ice;
