"use strict";

import utilities = require("../utilities/utilities");
import constant = require("../utilities/constants");
import world = require("../world/tiles");
import gravity = require("../physics/gravity");
import physics = require("../physics/physics");

/** @type {string} Current position. */
var currentPosition: Phaser.Point = new Phaser.Point(0, 0);
/** @type {string} Position we are moving towards. */
var nextPosition: Phaser.Point = new Phaser.Point(0, 0);

var input: Phaser.CursorKeys; 

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

        var x: number = utilities.floorToWorldTileCoordinate(start[0].x);
        var y: number = utilities.floorToWorldTileCoordinate(start[0].y);
        sprite = game.add.sprite(x, y, "player");
        game.physics.enable(sprite, Phaser.Physics.ARCADE);

        sprite.frame = 5;
        sprite.name = "player";
        // Current velocity of the sprite
        sprite.body.velocity = new Phaser.Point(0, 0);
        // Next position of the body -- used with the tile based movement.
        sprite.body.next = new Phaser.Point(0, 0);

        physics.physicsBodies.push(sprite.body);
        input = game.input.keyboard.createCursorKeys();
    }

    export function checkInputs(game: Phaser.Game) {
        if (physics.isMovingBodies) {
            return;
        }

        if (input.left.isDown) {
            console.log("left");
            sprite.body.velocity.x = constant.Velocity * game.time.elapsed * -1;
            sprite.body.velocity.y = 0;
            sprite.body.next.x = utilities.floorToWorldTileCoordinate(( sprite.body.x - (constant.TileSize.width / 2) ));
            sprite.body.next.y = sprite.body.y;
        } else if (input.right.isDown) {
            console.log("right");
            sprite.body.velocity.x = constant.Velocity * game.time.elapsed;
            sprite.body.velocity.y = 0;
            sprite.body.next.x = utilities.floorToWorldTileCoordinate(sprite.body.x + (constant.TileSize.width * 1.5));
            sprite.body.next.y = sprite.body.y;
        }

        // TODO climbing
        // TODO magic wand / breathe ice
    };

    /**
     * What happens when the player dies.
     */
    export function death() {
        // TODO: Play death animation, show menu for quit + retry
        sprite.kill();
    }

    export function update(game: Phaser.Game) {
        checkInputs(game);

    
    }
}

export = player;
