"use strict";

import player = require("../player/player");
import blocks = require("../blocks/blocks");
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
     * Resolves Player collision with the target Block.
     * @param {Phaser.Sprite} player Player
     * @param {Phaser.Sprite} block Block
     */
    export function playerToBlockCollision(player: Phaser.Sprite, block: Phaser.Sprite) {
        console.log("Player colliding with block", player, block);
        block.body.velocity.x = player.body.velocity.x;
        player.body.velocity.x = 0;
    };

    /**
     * Resolves Player collision with the target Fire.
     * @param {Phaser.Sprite} player Player
     * @param {Phaser.Sprite} target Target fire
     */
    export function playerToTargetCollision(player: Phaser.Sprite, target: Phaser.Sprite) {
        // TODO kill player
        console.log("kill player", player, target);
    };

    export function iceOverlapsFire(ice: Phaser.Sprite, fire: Phaser.Sprite) {
        console.log("Ice is overlapping fire.");
        ice.kill();
        fire.kill();
    };

    /**
     * Debug collision resolver. Prints out the collision targets and nothing else.
     * @param {any} obj1 Object that is colliding to obj2.
     * @param {any} obj2 Object that is the target of the collision
     */
    export function debugCollisionHandler(obj1: any, obj2: any) {
        console.log("obj1", obj1, ", obj2", obj2);
    };

    export function resolve(game: Phaser.Game) {
        // PLAYER VS THE OBJECTS
        game.physics.arcade.collide(player.sprite, world.layers["collision"]);
        game.physics.arcade.collide(player.sprite, fires.sprites, playerToTargetCollision, null, this);
        game.physics.arcade.collide(player.sprite, blocks.sprites, playerToBlockCollision, null, this);

        // TARGET VS BLOCKS
        game.physics.arcade.overlap(blocks.sprites, fires.sprites, iceOverlapsFire, null, this);
    }
}

export = resolver;