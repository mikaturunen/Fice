
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

function isTileBlockingMovementVelocity(body: PhysicsBody) {
    return world.map.getTileWorldXY(
            body.x + body.velocity.x, 
            body.y + body.velocity.y,
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
    // Stops moving left or right if there's a Tile blocking the path
    if (isTileBlockingMovement(body.next.x, body.next.y) ) {
        body.velocity.x = body.velocity.y = 0;
    } else if (body.tiledType !== "PLAYER" && isTileBlockingMovementVelocity(body)) {
        // TODO move object to tile position
        body.velocity.x = body.velocity.y = 0;
    }

    body.x += body.velocity.x;
    body.y += body.velocity.y;

    // Stops the movement if the moving body has reached it's ending position
    if (body.tiledType === "PLAYER" && utilities.onNextPosition(body)) {
        console.log("body reached position: ", body, body.next);
        body.velocity.x = body.velocity.y = 0;
        body.x = body.next.x;
        body.y = body.next.y;
    }
}

function findFirstTileUnderBody(body: PhysicsBody) {
    var x: number = Math.floor((body.x + constant.TileSize.width * 0.5) / constant.TileSize.width);
    var y: number = Math.floor(body.y / constant.TileSize.heigth);

    console.log("x, y: ", x, y + 1);
    var tileY: number = recursiveFindFirstTileUnderBody(x, y + 1);
    body.next.x = body.x;
    body.next.y = tileY * constant.TileSize.heigth;
    console.log("Set the tile coordinates to be: ", tileY, ", ", body.next.y);
}

function recursiveFindFirstTileUnderBody(x: number, y: number): number {
    if (world.map.getTile(x, y, "collision")) {
        console.log("Tile found below body on Y:", y - 1);
        return y - 1;
    } 

    return recursiveFindFirstTileUnderBody(x, y + 1);
}

/** 
 * Checks collision between two PhysicsBody objects. Current one being the one hitting target.
 * @param {PhysicsBody} current 
 * @param {PhysicsBody} target
 */
function checkCollision(current: PhysicsBody, target: PhysicsBody) {
    var transferForce: boolean = false;
    var stopCurrent: boolean = false;

    if(current.tiledType === "PLAYER") {
        transferForce = true;
    }

    // TODO use transferForce to make ice blocks move when player pushes them

    // Build positions around the current bodys tiles in tile coordinates so we can if those positions contain anything
    var currentX: number       = Math.round(current.x / constant.TileSize.width);
    var currentY: number       = Math.round(current.y / constant.TileSize.heigth);
    var currentLeft: number    = currentX;
    var currentRight: number   = currentX + 1; 
    var currentTop: number     = currentY - 1;
    var currentBottom: number  = currentY + 1; 
    var targetX: number        = Math.round(target.x / constant.TileSize.width);
    var targetY: number        = Math.round(target.y / constant.TileSize.heigth);

    if(current.velocity.x <= -constant.VelocityTreshold && currentLeft === targetX && currentY === targetY) {
        // Moving Left
        stopCurrent = true;
    } else if (current.velocity.x >= constant.VelocityTreshold && currentRight === targetX && currentY === targetY) {
        // Moving Right
        stopCurrent = true;
    }

    if (stopCurrent) {
        if (transferForce) {
            transferVelocity(current, target);
        }

        current.velocity.x = current.velocity.y = 0;
        return true;
    }

    return false;
}

function transferVelocity(current: PhysicsBody, target: PhysicsBody) {
    // Velocity transferred, we still need to calculate new next position for the body we pushed
    target.velocity.x = current.velocity.x;    
    physics.isMovingBodies = true;

    // First find out which direction the body is moving towards to
    var targetX: number = Math.round(target.x / constant.TileSize.width);
    var targetY: number = Math.round(target.y / constant.TileSize.heigth);
    target.next.y = target.y;

    if(target.velocity.x <= -constant.VelocityTreshold) {
        // Moving Left
        console.log("Force left -- ", current.velocity.x, target.velocity.x);
        target.next.x = Math.round((targetX - 1) * constant.TileSize.width)
    } else if (target.velocity.x >= constant.VelocityTreshold) {
        // Moving Right
        console.log("Force right -- ", current.velocity.x, target.velocity.x);
        target.next.x = Math.round((targetX + 1) * constant.TileSize.width)
    }
}

function anotherBodyUnder(current: PhysicsBody, index: number) {
    var isBodyUnder: boolean = false;

    physics.physicsBodies.forEach((target: PhysicsBody, targetIndex: number) => {
        if (isBodyUnder || index === targetIndex) {
            return;
        }

        var currentY: number = Math.round(current.y / constant.TileSize.heigth);
        var targetY: number  = Math.round(target.y / constant.TileSize.heigth);
        if (currentY + 1 === targetY) {
            isBodyUnder = true;
        }
    });

    return isBodyUnder;
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

        // When we have more than zero moving bodies, the general isMovingBodies flag is set to true
        var movingBodies: PhysicsBody[] = [];
        // If current vs target is a collision, the target is flagged into this array so that it does not get
        // rechecked 
        var readyBodiesIndices: PhysicsBody[] = [];

        physics.physicsBodies.forEach((body: PhysicsBody, index: number) => {
            // Check collisions against other physics Bodies and see if the force is translated to another body
            physics.physicsBodies.forEach((targetBody: PhysicsBody, targetIndex: number) => {
                // Skip self -- Body cannot collide with itself, at least not for now ;)
                if (index === targetIndex || readyBodiesIndices.indexOf(body) !== -1) {
                    return;
                }

                if (checkCollision(body, targetBody)) {
                    readyBodiesIndices.push(targetBody);
                    console.log(body.tiledType, body.velocity.x, targetBody.tiledType, targetBody.velocity.x, targetIndex);
                }
            });

            // Essentially moves the body and checks if it needs to stop after reaching it's "next" position / hit a 
            // blocking tile.
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

                if (!tile && !anotherBodyUnder(body, index)) {
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
