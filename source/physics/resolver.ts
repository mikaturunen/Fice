"use strict";

import player = require("../player/player");
import ice = require("../ice/ice");
import fires = require("../fires/fire");
import world = require("../world/tiles");

// The whole idea is to try and use Phasers physics engine for physics body
// resolving and on top of that we manually work some magic on it to make sure
// everything moves in a lovely old-school way. Worst case scenario: We should
// have ripped out the phasers physics engine from the start but we'll see ;)

/**
 * @module resolver
 * Super simple solver module for handling the different collision situations.
 * Phasers physics engine will take care of actual "what collides with what" and
 * resolving the situations, we just handle the results. Like what happens if
 * Player collides with Fire and such. We potentially will have to help it quite
 * a bit as we are aiming to go with that authentic old-school physics style of
 * the game we are remaking so... We'll see.
 */
module resolver {

    /**
     * Resolves Player collision with the target ice.
     * @param {Phaser.Sprite} player Player
     * @param {Phaser.Sprite} ice Ice
     */
    export function playerToIceCollision(player: Phaser.Sprite, ice: Phaser.Sprite) {
        console.log("Player colliding with Ice", player, ice);
        ice.body.velocity.x = player.body.velocity.x;
        player.body.velocity.x = 0;
    };

    /**
     * Resolves the situation where the Ice block overlaps an Fire block.
     */
    export function iceExtinguishesFire(ice: Phaser.Sprite, fire: Phaser.Sprite) {
        console.log("Ice is overlapping fire.");
        ice.kill();
        fire.kill();
    };

    /**
     * Resolves the situation where the Player runs into an fire block and dies.
     */
    export function playerDiesOnFire(playerSprite: Phaser.Sprite, fire: Phaser.Sprite) {
        console.log("Player dies on fire.");
        player.death();
    };

    /**
     * Debug collision resolver. Prints out the collision targets and nothing else.
     * @param {any} obj1 Object that is colliding to obj2.
     * @param {any} obj2 Object that is the target of the collision
     */
    export function debugCollisionHandler(obj1: any, obj2: any) {
        console.log("obj1", obj1, ", obj2", obj2);
    };

    /**
     * Aims to resolve all the collision and / or overlap cases for different
     * entities in the game.
     * @param {Phaser.Game} game Game object from Phaser.
     */
    export function resolve(game: Phaser.Game) {
        // PLAYER VS THE OBJECTS

        game.physics.arcade.collide(player.sprite, ice.sprites, playerToIceCollision, null, this);

        // Real, solved cases.
        game.physics.arcade.collide(player.sprite, world.layers["collision"]);
        game.physics.arcade.collide(ice.sprites, world.layers["collision"]);

        game.physics.arcade.overlap(player.sprite, fires.sprites, playerDiesOnFire, null, this);
        game.physics.arcade.overlap(ice.sprites, fires.sprites, iceExtinguishesFire, null, this);
    }
}

export = resolver;
