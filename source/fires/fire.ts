"use strict";


module fire {
    export var sprites: Phaser.Group;

    /** @type {string} Current position. */
    var currentPosition: Phaser.point = new Phaser.Point(0, 0);

    /** @type {string} Position we are moving towards. */
    var nextPosition: Phaser.point = new Phaser.Point(0, 0);

    export function init(game: Phaser.Game) {
        fire.sprites = game.add.group();
        utilities.fillSpriteGroup(blockGroup, "TARGET", "entities", 3, game);
    }
}

export = fire;
