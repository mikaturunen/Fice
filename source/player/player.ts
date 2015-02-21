"use strict";


module player {
    export var sprite: Phaser.Sprite;
    
    /** @type {string} Current position. */
    var currentPosition: Phaser.point = new Phaser.Point(0, 0);

    /** @type {string} Position we are moving towards. */
    var nextPosition: Phaser.point = new Phaser.Point(0, 0);
}

export = player;
