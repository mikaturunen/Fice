
import constant = require("../utilities/constants");
import utilities = require("../utilities/utilities");
import world = require("../world/tiles");

function isTileBlockingMovement(pixelCoordinateX: number, pixelCoordinateY: number) {
    return world.map.getTileWorldXY(
            pixelCoordinateX, 
            pixelCoordinateY, 
            constant.TileSize.width, 
            constant.TileSize.heigth, 
            "collision"
        ) ? true : false;
}

function isMoving(body: PhysicsBody) {
    return  body.velocity.x >=  constant.VelocityTreshold || 
            body.velocity.x <= -constant.VelocityTreshold ||
            body.velocity.y >=  constant.VelocityTreshold ||
            body.velocity.y <= -constant.VelocityTreshold;
}

function move(body: PhysicsBody) {
    body.x += body.velocity.x;
    body.y += body.velocity.y;

    if (utilities.onNextPosition(body)) {
        body.velocity.x = body.velocity.y = 0;
        body.x = body.next.x;
        body.y = body.next.y;
    }
}

function recursiveFindFirstTileUnderBody(x: number, y: number): number {
    if (world.map.getTile(x, y, "collision")) {
        console.log("Tile found below body on Y:", y - 1);
        return y - 1;
    } 

    return recursiveFindFirstTileUnderBody(x, y + 1);
}

function findFirstTileUnderBody(body: PhysicsBody) {
    var x: number = Math.floor((body.x + constant.TileSize.width * 0.5) / constant.TileSize.width);
    var y: number = Math.floor(body.y / constant.TileSize.heigth);

    console.log("x,y: ", x, y + 1);
    var tileY: number = recursiveFindFirstTileUnderBody(x, y + 1);
    body.next.x = body.x;
    body.next.y = tileY * constant.TileSize.heigth;
    console.log("Set the tile coordinates to be: ", tileY, ", ", body.next.y);
}

module physics {
    
    export var isMovingBodies: boolean = false;

    /** @type {Phaser.Physics.Arcade.Body[]} Set of bodies the Games physics affect */
    export var physicsBodies: PhysicsBody[] = [];

    export function update(game: Phaser.Game) {
        if (!physics.isMovingBodies) {
            // Early quit - as we work on "one thing can move at a time" type of distinction
            // we can abuse it like this too, no need to perform any checks if everything's stopped ;)
            return;
        }

        var movingBodies: PhysicsBody[] = [];

        physics.physicsBodies.forEach(body => {
            move(body);

            if (isMoving(body)) {
                // Body is moving, we'll store it so we can notify the module that we still do have moving bodies
                movingBodies.push(body);
            } else {
                // Body is not moving, apply gravity to it to see if it starts falling as it has reached the 
                // potentially new tile.
                
                // Calculate a position from current sprites center to the center of one tile below and then floor the
                // value.
                var x: number = body.x + (constant.TileSize.width / 2);
                var y: number = body.y + (constant.TileSize.heigth * 1.5);
                var tile: Phaser.Tile = world.map.getTileWorldXY(x, y, constant.TileSize.width, 
                    constant.TileSize.heigth, "collision");

                if (!tile) {
                    findFirstTileUnderBody(body);
                    body.velocity.x = 0;
                    body.velocity.y = constant.Velocity * game.time.elapsed;
                    movingBodies.push(body);
                }
            }
        });
        
        physics.isMovingBodies = movingBodies.length > 0;
    }

}

export = physics;
