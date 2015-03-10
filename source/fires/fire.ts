"use strict";

import utilities = require("../utilities/utilities");
import physics = require("../physics/physics");

/**
 * @module fire
 * Fire entity module.
 */
module fire {
    export var sprites: Phaser.Group;

    export function init(game: Phaser.Game) {
        fire.sprites = game.add.group();
        utilities.fillSpriteGroup(fire.sprites, "FIRE", "entities", 8, game);
        console.log("Found", sprites.length, "fires");
        
        fire.sprites.children.forEach((sprite: Phaser.Sprite) => {
            game.physics.enable(sprite, Phaser.Physics.ARCADE);
            sprite.name = "FIRE";
            sprite.body.tiledType = "FIRE";
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

    export function update(game: Phaser.Game) {
        var deadSprites = fire.sprites.children.filter((s: Phaser.Sprite) => s.body.isDead === true);
        fire.sprites.children = fire.sprites.children.filter((s: Phaser.Sprite) => s.body.isDead === false);

        if (deadSprites.length > 0) {
            console.log("Found death fire sprites", deadSprites.length);
        }
    }
}

export = fire;
