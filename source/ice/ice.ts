
"use strict";

import utilities = require("../utilities/utilities");
import gravity = require("../physics/gravity");
import physics = require("../physics/physics");

/** @type {string} Current position. */
var currentPosition: Phaser.Point = new Phaser.Point(0, 0);

/** @type {string} Position we are moving towards. */
var nextPosition: Phaser.Point = new Phaser.Point(0, 0);

/**
 * @mobule ice
 * ice module.
 */
module ice {
    export var sprites: Phaser.Group;

    /**
     * Initializes the ice sprites into the game. Populates ice.sprites.
     * @param {Phaser.Game} game Game object from Phaser.
     */
    export function init(game: Phaser.Game) {
        ice.sprites = game.add.group();
        utilities.fillSpriteGroup(ice.sprites, "BLOCK", "entities", 0, game);

        ice.sprites.children.forEach((sprite: Phaser.Sprite)  => {
            game.physics.enable(sprite, Phaser.Physics.ARCADE);
            sprite.name = "ICE";
            sprite.body.tiledType = "ICE";
            // Current velocity of the sprite
            sprite.body.velocity = new Phaser.Point(0, 0);
            sprite.body._uniqueId = utilities.getRunningId();
            // Next position of the body -- used with the tile based movement.
            sprite.body.next = new Phaser.Point(0, 0);
            sprite.body.previous = new Phaser.Point(0, 0);
            physics.physicsBodies.push(sprite.body);
            sprite.body.isDead = false;
        });
    }

    /**
     * Updates ice sprites and their behari
     * @param {Phaser.Game} game Game object from Phaser.
     */
    export function update(game: Phaser.Game) {
        ice.sprites.children.forEach((sprite: Phaser.Sprite)  => {
            if (sprite.body.isDead) {
                physics.killBody(sprite.body);
                sprite.kill();
                console.log("ice death");
            }
        });
    }
}

export = ice;
