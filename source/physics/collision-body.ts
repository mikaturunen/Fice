"use strict";

import constant = require("../utilities/constants");

/**
 * Creates the actual CollisionBody from the given details
 * @param {number} x         X in units (not in pixel coordinates), tile units.
 * @param {number} y         Y in units (not in pixel coordinates), tile units.
 * @param {number} velocityX X component of velocity vector
 * @param {number} velocityY Y component of velocity vector
 * @param {number} _uniqueId Unique ID of body, -1 always for Tiles
 */
function collisionBody(x: number, y: number, velocityX: number, velocityY: number, _uniqueId: number) {
    return <CollisionBody> {
        tile: {  
            x: x,
            y: y
        },
        coordinates: {
            x: x * constant.TileSize.width,
            y: y * constant.TileSize.heigth
        },
        velocity: { 
            x: velocityX, 
            y: velocityY 
        },
        width: constant.TileSize.width,
        heigth: constant.TileSize.heigth,
        _uniqueId: _uniqueId
    };
}

/**
 * module for creating and manipulating CollisionBody objects from other objects.
 * @module collision_body
 */
module collision_body {
    "use strict";

    /**
     * Creates CollisionBody from Tile object. Note that the _uniqueId for Tiles is always -1.
     * @param {Phaser.Tile} tile
     * @returns {CollisionBody} CollisionBody object.
     */
    export function fromTile(tile: Phaser.Tile) {
        return collisionBody(tile.x, tile.y, 0, 0, -1);
    }

    /**
     * Creates CollisionBodies from Tile objects. Note that the _uniqueId for Tiles is always -1.
     * @param {Phaser.Tile[]} tiles
     * @returns {CollisionBody[]} CollisionBody objects
     */
    export function fromTiles(tiles: Phaser.Tile[]) {
        return tiles.map(t => collisionBody(t.x, t.y, 0, 0, -1));
    }

    /**
     * Creates CollisionBody from PhysicsBody object.
     * @param {PhysicsBody} body
     * @returns {CollisionBody} CollisionBody object.
     */
    export function fromPhysicsBody(body: PhysicsBody) {
        return collisionBody(
                Math.round(body.x / constant.TileSize.width), 
                Math.round(body.y / constant.TileSize.heigth), 
                body.velocity.x, 
                body.velocity.y, 
                body._uniqueId
            );
    }

    /**
     * Creates CollisionBodies from PhysicsBody objects.
     * @param {PhysicsBody} bodies List of bodies to turn at the same time
     * @returns {CollisionBody} CollisionBody object.
     */
    export function fromPhysicsBodies(bodies: PhysicsBody[]) {
        return bodies.map(
            b => 
                collisionBody(
                    Math.round(b.x / constant.TileSize.width), 
                    Math.round(b.y / constant.TileSize.heigth), 
                    b.velocity.x, 
                    b.velocity.y, 
                    b._uniqueId
                )
            );
    }

    /** 
     * Checks if any bodies in the bodies collection are right on top of given Body. Blocking upward motion.
     * @param {CollisionBody}   body   
     * @param {CollisionBody[]} bodies Set of bodies to check body against
     * @returns {boolean} returns true when nothing is on top.
     */
    export function nothingOnTop(body: CollisionBody, bodies: CollisionBody[]) {
        // when .some returns false -- nothing was found above, we return true as nothing is above
        var yLevelAbove: number = body.tile.y - 1;

        for (var i = 0; i < bodies.length ; i++) {
            console.log("body x:", body.tile.x, bodies[i].tile.x, "body y:", yLevelAbove, bodies[i].tile.y);
            if (bodies[i].tile.y === yLevelAbove && bodies[i].tile.x === body.tile.x) {
                return true;
            }
        }

        return false;
    }
}

export = collision_body;
