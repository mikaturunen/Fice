"use strict";

/**
 * @module solver
 * Super simple solver module for handling the different collision situations.
 * Phasers physics engine will take care of actual "what collides with what" and
 * resolving the situations, we just handle the results. Like what happens if
 * Player collides with Fire and such. We potentially will have to help it quite
 * a bit as we are aiming to go with that authentic old-school physics style of
 * the game we are remaking so... We'll see.
 */
module solver {

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

}

export = solver;
