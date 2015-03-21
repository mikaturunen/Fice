"use strict";

import utilities = require("../utilities/utilities");
import constant = require("../utilities/constants");
import world = require("../world/tiles");
import gravity = require("../physics/gravity");
import physics = require("../physics/physics");

var input: Phaser.CursorKeys; 
var isFacingLeft: boolean = true;
var constantAnimationSpeed: number = 8;

/** 
 * Based on different velocity conditions, sets the players animation to the correct animation loop.
 * Physics engine can also tinker with players animations.
 */
function setAnimationFrames() {
    if (physics.currentlyMovingBody && player.sprite.body._uniqueId !== physics.currentlyMovingBody._uniqueId) {
        // TODO only few animations we can set when we are not actively moving
        return;
    }

    // Player actively moving, inspect velocity and decide on animation based on that.
    if (constant.isDirectionLeft(player.sprite.body.x)) {
        player.sprite.animations.play("left", constantAnimationSpeed, true);
    } else if (constant.isDirectionRight(player.sprite.body.x)) {
        player.sprite.animations.play("right", constantAnimationSpeed, true);
    } else if (constant.isDirectionDown(player.sprite.body.y)) {

        if (isFacingLeft) {
            player.sprite.animations.play("fallingLeft", constantAnimationSpeed, true);
        } else {
            player.sprite.animations.play("fallingRight", constantAnimationSpeed, true);
        }

    } else {
        // Player is not moving
        // IDLE left / right
        if (isFacingLeft) {
            player.sprite.animations.play("idleLeft", constantAnimationSpeed, true);
        } else {
            player.sprite.animations.play("idleRight", constantAnimationSpeed, true);
        }
    }
}

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
        var start: TiledObject[] = utilities.createFromType("START", "entities", world.currentLevelJson);

        if (start.length <= 0) {
            throw "Could not load START entity from given map. Please make sure you have a start defined";
        }

        var x: number = utilities.floorToWorldTileCoordinate(start[0].x);
        var y: number = utilities.floorToWorldTileCoordinate(start[0].y);
        sprite = game.add.sprite(x, y, "player");
        game.physics.enable(sprite, Phaser.Physics.ARCADE);

        sprite.frame = 5;
        sprite.name = "PLAYER";
        sprite.body.tiledType = "PLAYER";
        // Current velocity of the sprite
        sprite.body.velocity = new Phaser.Point(0, 0);
        sprite.body._uniqueId = utilities.getRunningId();
        // Next position of the body -- used with the tile based movement.
        sprite.body.next = new Phaser.Point(0, 0);
        sprite.body.previous = new Phaser.Point(0, 0);
        sprite.body.hasJustStarted = false;
        sprite.body.____isOnTopOfBody = false;
        sprite.body.isDead = false;

        sprite.animations.add("left", [ 9, 10, 11, 10 ]);
        sprite.animations.add("right", [ 0, 1, 2, 1 ]);
        sprite.animations.add("idleLeft", [ 14 ]);
        sprite.animations.add("idleRight", [ 5 ]);
        sprite.animations.add("fallingLeft", [ 15 ]);
        sprite.animations.add("fallingRight", [ 4 ]);
        sprite.animations.add("pushLeft", [ 9 ]);
        sprite.animations.add("pushRight", [ 2 ]);
        sprite.animations.add("death", [ 7 ]);

        physics.physicsBodies.push(sprite.body);
        input = game.input.keyboard.createCursorKeys();
    }

    export function checkInputs(game: Phaser.Game) {
        if (physics.currentlyMovingBody) {
            setAnimationFrames();
            return;
        }

        // TODO instead of setting velocity here, give direction and then in physics module we give it the delta
        // velocity each loop it deservers, with love. 

        var x: number;
        if (input.left.isDown) {
            console.log("left");
            x = sprite.body.x - (constant.TileSize.width / 2) ;
            sprite.body.velocity.x = constant.Velocity * game.time.elapsed * -1;
            sprite.body.velocity.y = 0;
            sprite.body.next.x = utilities.floorToWorldTileCoordinate(x);
            sprite.body.next.y = sprite.body.y;
            isFacingLeft = true;
        } else if (input.right.isDown) {
            console.log("right");
            sprite.body.velocity.x = constant.Velocity * game.time.elapsed;
            sprite.body.velocity.y = 0;
            sprite.body.next.x = utilities.floorToWorldTileCoordinate(sprite.body.x + (constant.TileSize.width * 1.5));
            sprite.body.next.y = sprite.body.y;
            isFacingLeft = false;
        }

        // TODO climbing
        // TODO magic wand / breathe ice

        if (sprite.body.velocity.x >=  constant.VelocityTreshold || 
            sprite.body.velocity.x <= -constant.VelocityTreshold) {

            physics.currentlyMovingBody = player.sprite.body;
            sprite.body.hasJustStarted = true;
        } 

        setAnimationFrames();
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

        if (player.sprite.body.isDead) {
            physics.killBody(player.sprite.body);
            player.death();
            console.log("player death");
        }
    }
}

export = player;
