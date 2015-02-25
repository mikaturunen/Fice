"use strict";

import world = require("../world/tiles");
import utilities = require("../utilities/utilities");
import constant = require("../utilities/constants");

/**
 * @module gravity
 * Gravity module. We are not using the Phaser physics engines physics.arcade.gravity
 * because it causes a steady growth in velocity to a point X and we need to have our
 * falling bodies on a constant speed from the second they start and make sure other
 * bodies cannot move during this. Game uses set of extra rules that phasers gravity
 * obviously does not handle.
 */
module gravity {
    /**
     * Checks if a body starts to fall with constant velocity from the start.
     * @param {Phaser.Sprite} sprite Sprite to check for if it can start falling
     */
    export function checkCanSpriteStartFalling(sprite: Phaser.Sprite) {
        var tileX = utilities.floorToWorldTileCoordinate(sprite.body.x);
        var tileY = utilities.floorToWorldTileCoordinate(sprite.body.y +
            constant.TileSize.heigth);

        if (!world.map.hasTile(tileX, tileY, world.layers["collision"])) {
            sprite.body.velocity.y = constant.Velocity;
            console.log("Started falling", sprite.name);
            return true;
        }

        return false;
    };

    export function checkCanGroupStartFalling(group: Phaser.Group) {
        // We use the same function for both sprites and groups
        if (group.children && group.children.length <= 0) {
            return;
        }

        group.children.forEach((sprite: Phaser.Sprite) => {
            checkCanSpriteStartFalling(sprite);
        });
    };
}

export = gravity;
