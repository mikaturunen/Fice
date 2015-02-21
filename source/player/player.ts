"use strict";

import utilities = require("../utilities/utilities");
import constants = require("../utilities/constants");

/**
 * @module player
 * Player module for controlling and managing the Player entity
 */
module player {
    export var sprite: Phaser.Sprite;

    /** @type {string} Current position. */
    var currentPosition: Phaser.point = new Phaser.Point(0, 0);

    /** @type {string} Position we are moving towards. */
    var nextPosition: Phaser.point = new Phaser.Point(0, 0);

    /**
     * Initializes the player into the game correctly.
     * @param {Phaser.Game} game Game object from Phaser.
     */
    export function init(game: Phaser.Game) {
        // TODO once the initial prototyping phase is over; read the information from Phaser.Tilemap
        // TODO --> https://github.com/photonstorm/phaser/pull/1609 -- merged, waits release
        var start: TiledObject[] = utilities.createFromType("START", "entities", lvlJson);

        if (start.length <= 0) {
            throw "Could not load START entity from given map. Please make sure you have a start defined";
        }

        var position = getFlooredWorldCoordinateFromWorldCoordinates(start[0].x, start[0].y, tileSizes);
        player = game.add.sprite(position.x, position.y, "player");
        player.frame = 5;
        player.body.collideWorldBounds = true;
        player.body.setSize(constants.TileSize.width, constants.TileSize.heigth);
        game.physics.enable(player, Phaser.Physics.ARCADE);
    }
}

export = player;
