"use strict";

import utilities = require("../utilities/utilities");
import constants = require("../utilities/constants");
import world = require("../world/tiles");

/** @type {string} Current position. */
var currentPosition: Phaser.point = new Phaser.Point(0, 0);
/** @type {string} Position we are moving towards. */
var nextPosition: Phaser.point = new Phaser.Point(0, 0);

function falling() {
    var tileX = utilities.getTileXFromWorldCoordinate(player.sprite.body.x);
    var tileY = utilities.getTileYFromWorldCoordinate(player.sprite.body.y +
        utilities.TileSize.heigth);

    if (!world.map.hasTile(tileX, tileY, layers["collision"])) {
        sprite.body.velocity.y = constants.Velocity;
        console.log("Started falling");
        return true;
    }

    return false;
};

function checkMovement() {
    if (falling()) {
        // ?
    } else if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
        console.log("Moving left");
        getNextTileWorldCoordinates(-1);
    } else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
        console.log("Moving right");
        getNextTileWorldCoordinates(+1);
    }
};

function getNextTileWorldCoordinates(velocityDirectionMultiplier: number) {
    var velocity = constants.Velocity * velocityDirectionMultiplier;
    nextPosition.x = utilities.getTileFlooredXWorldCoordinate(
            player.sprite.body.x + (constants.TileSize.width * velocityDirectionMultiplier)
        );
    player.sprite.body.velocity.x = velocity;
    console.log("current.x/nextPosition.x", player.sprite.body.x, "/", nextPosition.x, ", nextPosition.y", nextPosition.y, ", velocity:", velocity);
};

/**
 * @module player
 * Player module for controlling and managing the Player entity
 */
module player {
    export var sprite: Phaser.Sprite;

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

    export function checkInputs() => {
        if ( (sprite.body.velocity.x >= -treshold && sprite.body.velocity.x <= treshold) ||
             (sprite.body.velocity.y <= treshold) ) {

            console.log("velocity.x:", sprite.body.velocity.x, ", velocity.y:", sprite.body.velocity.y);
            checkMovement();
        }
    };
}

export = player;
