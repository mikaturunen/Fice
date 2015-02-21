"use strict";

import utilities = require("../utilities/utilities");
import constant = require("../utilities/constants");
import world = require("../world/tiles");

/** @type {string} Current position. */
var currentPosition: Phaser.Point = new Phaser.Point(0, 0);
/** @type {string} Position we are moving towards. */
var nextPosition: Phaser.Point = new Phaser.Point(0, 0);

function falling() {
    var tileX = utilities.getTileXFromWorldCoordinate(player.sprite.body.x);
    var tileY = utilities.getTileYFromWorldCoordinate(player.sprite.body.y +
        constant.TileSize.heigth);

    if (!world.map.hasTile(tileX, tileY, world.layers["collision"])) {
        player.sprite.body.velocity.y = constant.Velocity;
        console.log("Started falling");
        return true;
    }

    return false;
};

function checkMovement(game: Phaser.Game) {
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
    var velocity = constant.Velocity * velocityDirectionMultiplier;
    nextPosition.x = utilities.getTileFlooredXWorldCoordinate(
            player.sprite.body.x + (constant.TileSize.width * velocityDirectionMultiplier)
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
        var start: TiledObject[] = utilities.createFromType("START", "entities", utilities.lvlJson);

        if (start.length <= 0) {
            throw "Could not load START entity from given map. Please make sure you have a start defined";
        }

        var x: number = utilities.getTileFlooredXWorldCoordinate(start[0].x);
        var y: number = utilities.getTileFlooredYWorldCoordinate(start[0].y);
        sprite = game.add.sprite(x, y, "player");
        sprite.frame = 5;
        sprite.body.collideWorldBounds = true;
        sprite.body.setSize(constant.TileSize.width, constant.TileSize.heigth);
        game.physics.enable(sprite, Phaser.Physics.ARCADE);
    }

    export function checkInputs(game: Phaser.Game) {
        if ( (sprite.body.velocity.x >= -constant.VelocityTreshold &&
              sprite.body.velocity.x <= constant.VelocityTreshold) ||
             (sprite.body.velocity.y <= constant.VelocityTreshold) ) {

            console.log("velocity.x:", sprite.body.velocity.x, ", velocity.y:", sprite.body.velocity.y);
            checkMovement(game);
        }
    };


    export function checkStopConditions(game: Phaser.Game) {
        // CHECK FOR COLLISION WITH NEXT TILE -> STOP PLAYER
        var setPlayerToPosition: boolean = false;

        // START FALLING -- arrived on tile below
        if (player.sprite.body.velocity.y > constant.VelocityTreshold) {
            console.log("(F) To position:", player.sprite.body.velocity.x, player.sprite.body.x, nextPosition.x);
        }

        // MOVING LEFT -- arrived to tile
        if (player.sprite.body.velocity.x < -constant.VelocityTreshold && player.sprite.body.x <= nextPosition.x) {
            setPlayerToPosition = true;
            console.log("(L) To position:", player.sprite.body.velocity.x, player.sprite.body.x, nextPosition.x);
        }

        // MOVING RIGHT -- arrived to tile
        if (player.sprite.body.velocity.x > constant.VelocityTreshold && player.sprite.body.x >= nextPosition.x) {
            setPlayerToPosition = true;
            console.log("(R) To position:", player.sprite.body.velocity.x, player.sprite.body.x, nextPosition.x);
        }

        if (setPlayerToPosition) {
            if (!checkMovement(game)) {
                player.sprite.body.x = nextPosition.x;
                player.sprite.body.velocity.x = 0;
            }
        }
    }
}

export = player;
