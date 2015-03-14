"use strict";

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
        return <CollisionBody> {
            tile: {  
                x: tile.x,
                y: tily.y
            },
            coordinates: {
                x: tile.x * constant.TileSize.width,
                y: tile.y * constant.TileSize.heigth
            },
            velocity: { 
                x: 0, 
                y: 0 
            },
            width: constant.TileSize.width,
            heigth: constant.TileSize.heigth,
            _uniqueId: -1
        };
    }

    /**
     * Creates CollisionBody from PhysicsBody object.
     * @param {PhysicsBody} body
     * @returns {CollisionBody} CollisionBody object.
     */
    export function fromPhysicsBody(body: PhysicsBody) {
        return <CollisionBody> {
            tile: {  
                x: Math.round(body.x / constant.TileSize.width),
                y: Math.round(body.y / constant.TileSize.heigth)
            },
            coordinates: {
                x: body.x,
                y: body.y,
            },
            velocity: {
                x: body.velocity.x,
                y: body.velocity.y
            },
            width: constant.TileSize.width,
            heigth: constant.TileSize.heigth,
            _uniqueId: body._uniqueId
        };
    }
}

export = collision_body;
