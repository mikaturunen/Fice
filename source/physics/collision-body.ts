"use strict";

/**
 * module for creating and manipulating CollisionBody objects from other objects.
 * @module collision_body
 */
module collision_body {
    "use strict";

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
     * Creates CollisionBody from Tile object. Note that the _uniqueId for Tiles is always -1.
     * @param {Phaser.Tile} tile
     * @returns {CollisionBody} CollisionBody object.
     */
    export function fromTile(tile: Phaser.Tile) {
        return collisionBody(tile.x, tile.y, 0, 0, -1);
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
     * Creates CollisionBody from PhysicsBody object.
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
}

export = collision_body;
