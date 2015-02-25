"use strict";

import utilities = require("../utilities/utilities");
import constant = require("../utilities/constants");
import world = require("../world/tiles");
import gravity = require("../physics/gravity");

/** @type {string} Current position. */
var currentPosition: Phaser.Point = new Phaser.Point(0, 0);
/** @type {string} Position we are moving towards. */
var nextPosition: Phaser.Point = new Phaser.Point(0, 0);

function checkMovement(game: Phaser.Game) {
    if (gravity.checkCanSpriteStartFalling(player.sprite)) {
        // ?
    } else if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
        console.log("Moving left");
        utilities.getNextTileWorldCoordinates(-1, player.sprite, currentPosition, nextPosition, game);
    } else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
        console.log("Moving right");
        utilities.getNextTileWorldCoordinates(+1, player.sprite, currentPosition, nextPosition, game);
    }
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
        sprite.name = "player";
        sprite.body.velocity = new Phaser.Point(0, 0);
        sprite.body.next = new Phaser.Point(0, 0);
    }

    export function checkInputs(game: Phaser.Game) {

    };

    /**
     * What happens when the player dies.
     */
    export function death() {
        // TODO: Play death animation, show menu for quit + retry
        sprite.kill();
    }

    /**
     * Checks if the player sprite needs to stop. Stops the player entity when required.
     * @param {Phaser.Game} game Game object from Phaser.
     */
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

    export function update(game: Phaser.Game) {
        checkInputs(game);

    }
}

export = player;
