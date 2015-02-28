
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

function isTileBlockingMovementVelocity() {
    return world.map.getTileWorldXY(
            physics.currentlyMovingBody.x + physics.currentlyMovingBody.velocity.x, 
            physics.currentlyMovingBody.y + physics.currentlyMovingBody.velocity.y,
            constant.TileSize.width, 
            constant.TileSize.heigth, 
            "collision"
        ) ? true : false;
}

function isMoving() {
    return  physics.currentlyMovingBody.velocity.x >=  constant.VelocityTreshold || 
            physics.currentlyMovingBody.velocity.x <= -constant.VelocityTreshold ||
            physics.currentlyMovingBody.velocity.y >=  constant.VelocityTreshold ||
            physics.currentlyMovingBody.velocity.y <= -constant.VelocityTreshold;
}

function move() {
    // Stops moving left or right if there's a Tile blocking the path
    if (isTileBlockingMovement(physics.currentlyMovingBody.next.x, physics.currentlyMovingBody.next.y) ) {
        console.log("Tile is blocking movement for currently moving body :( 1");
        physics.currentlyMovingBody.velocity.x = physics.currentlyMovingBody.velocity.y = 0;
    } else if (physics.currentlyMovingBody.tiledType !== "PLAYER" && isTileBlockingMovementVelocity()) {
        console.log("Tile is blocking movement for currently moving body :( 2");
        // TODO move object to tile position
        physics.currentlyMovingBody.velocity.x = physics.currentlyMovingBody.velocity.y = 0;
    }

    physics.currentlyMovingBody.x += physics.currentlyMovingBody.velocity.x;
    physics.currentlyMovingBody.y += physics.currentlyMovingBody.velocity.y;

    // Stops the movement if the moving body has reached it's ending position
    if (physics.currentlyMovingBody.tiledType === "PLAYER" && utilities.onNextPosition(physics.currentlyMovingBody)) {
        console.log("body reached position: ", physics.currentlyMovingBody, physics.currentlyMovingBody.next);
        physics.currentlyMovingBody.velocity.x = physics.currentlyMovingBody.velocity.y = 0;
        physics.currentlyMovingBody.x = physics.currentlyMovingBody.next.x;
        physics.currentlyMovingBody.y = physics.currentlyMovingBody.next.y;
    }
}

function findFirstTileUnderBody() {
    var x: number = Math.floor((physics.currentlyMovingBody.x + constant.TileSize.width * 0.5) / constant.TileSize.width);
    var y: number = Math.floor(physics.currentlyMovingBody.y / constant.TileSize.heigth);

    console.log("x, y: ", x, y + 1);
    var tileY: number = recursiveFindFirstTileUnderBody(x, y + 1);
    physics.currentlyMovingBody.next.x = physics.currentlyMovingBody.x;
    physics.currentlyMovingBody.next.y = tileY * constant.TileSize.heigth;
    console.log("Set the tile coordinates to be: ", tileY, ", ", physics.currentlyMovingBody.next.y);
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
function checkCollision(target: PhysicsBody) {
    var transferForce: boolean = false;
    var stopCurrent: boolean = false;

    if(physics.currentlyMovingBody.tiledType === "PLAYER") {
        transferForce = true;
    }

    // TODO use transferForce to make ice blocks move when player pushes them

    // Build positions around the current bodys tiles in tile coordinates so we can if those positions contain anything
    var currentX: number       = Math.round(physics.currentlyMovingBody.x / constant.TileSize.width);
    var currentY: number       = Math.round(physics.currentlyMovingBody.y / constant.TileSize.heigth);
    var currentLeft: number    = currentX;
    var currentRight: number   = currentX + 1; 
    var currentTop: number     = currentY - 1;
    var currentBottom: number  = currentY + 1; 
    var targetX: number        = Math.round(target.x / constant.TileSize.width);
    var targetY: number        = Math.round(target.y / constant.TileSize.heigth);

    if(physics.currentlyMovingBody.velocity.x <= -constant.VelocityTreshold 
        && currentLeft === targetX && currentY === targetY) {
        
        // Moving Left
        stopCurrent = true;
    } else if (physics.currentlyMovingBody.velocity.x >= constant.VelocityTreshold && 
        currentRight === targetX && currentY === targetY) {
        
        // Moving Right
        stopCurrent = true;
    }

    if (stopCurrent) {
        if (transferForce && physics.currentlyMovingBody.hasJustStarted) {
            transferVelocity(target);
            // Target has now become the only moving object in the game
            physics.stopCurrentAndSwap(target);
            console.log("Currently moving physics body swapped and previous stopped.");
        } else {
            physics.currentlyMovingBody.velocity.x = physics.currentlyMovingBody.velocity.y = 0;
            console.log("Currently moving physics body stopped.");
        }

        return true;
    }

    return false;
}

function transferVelocity(target: PhysicsBody) {
    // Velocity transferred, we still need to calculate new next position for the body we pushed
    target.velocity.x = physics.currentlyMovingBody.velocity.x;    
    
    // First find out which direction the body is moving towards to
    var targetX: number = Math.round(target.x / constant.TileSize.width);
    var targetY: number = Math.round(target.y / constant.TileSize.heigth);
    target.next.y = target.y;

    if(target.velocity.x <= -constant.VelocityTreshold) {
        // Moving Left
        console.log("Force left -- ", physics.currentlyMovingBody.velocity.x, target.velocity.x);
        target.next.x = Math.round((targetX - 1) * constant.TileSize.width)
    } else if (target.velocity.x >= constant.VelocityTreshold) {
        // Moving Right
        console.log("Force right -- ", physics.currentlyMovingBody.velocity.x, target.velocity.x);
        target.next.x = Math.round((targetX + 1) * constant.TileSize.width)
    }
}

function anotherBodyUnder() {
    var isBodyUnder: boolean = false;

    physics.physicsBodies.forEach((target: PhysicsBody) => {
        if (isBodyUnder || physics.currentlyMovingBody === target) {
            return;
        }

        var currentX: number = Math.round(physics.currentlyMovingBody.x / constant.TileSize.width);
        var currentY: number = Math.round(physics.currentlyMovingBody.y / constant.TileSize.heigth);
        var targetY: number  = Math.round(target.y / constant.TileSize.heigth);
        var targetX: number  = Math.round(target.x / constant.TileSize.width);

        if (currentY + 1 === targetY && currentX === targetX) {
            isBodyUnder = true;
        }
    });

    physics.currentlyMovingBody.____isOnTopOfBody = isBodyUnder;
    return isBodyUnder;
}

module physics {
    
    export var currentlyMovingBody: PhysicsBody;

    /** @type {Phaser.Physics.Arcade.Body[]} Set of bodies the Games physics affect */
    export var physicsBodies: PhysicsBody[] = [];

    export function stopCurrentAndSwap(newCurrentlyMovingBody: PhysicsBody) {
        // Stop current body first
        physics.currentlyMovingBody.velocity.x = physics.currentlyMovingBody.velocity.y = 0;
        
        // TODO do we need to set it to something or is stopping it enough?
        // physics.currentlyMovingBody.x = 0;
        //physics.currentlyMovingBody.y = 0;

        // Set the new body to be the new currently moving body <3
        physics.currentlyMovingBody = newCurrentlyMovingBody;
    }

    export function update(game: Phaser.Game) {
        if (!physics.currentlyMovingBody) {
            return;
        }

        // Sort the bodies into an order where the first is the one with the highest Y, so we start applying physics
        // from bottom to top from the screens perspective and the "one object at a time"-login works
        physics.physicsBodies = physics.physicsBodies.sort((l: PhysicsBody, r: PhysicsBody) => { 
            if (l.y < r.y) {
                return 1;
            } else if (l.y > r.y) {
                return -1;
            }
            return 0;
        });

        // Check collisions against other physics Bodies and see if the force is translated to another body
        physics.physicsBodies.forEach((targetBody: PhysicsBody) => {
            // Skip self -- Body cannot collide with itself, at least not for now ;)
            if (physics.currentlyMovingBody === targetBody) {
                return;
            }

            if (checkCollision(targetBody)) {
                console.log(
                        "Collision between bodies:", 
                        physics.currentlyMovingBody.tiledType, 
                        physics.currentlyMovingBody.velocity.x, 
                        targetBody.tiledType, 
                        targetBody.velocity.x
                    );
            }
        });

        if (!physics.currentlyMovingBody) {
            return;
        }

        // Essentially moves the body and checks if it needs to stop after reaching it's "next" position / hit a 
        // blocking tile.
        move();

        // The body has gone through at least ONE physics cycle, we no longer consider it to just have started
        // moving 
        physics.currentlyMovingBody.hasJustStarted = false;

        if (!isMoving()) {
            // Body is not moving, apply gravity to it to see if it starts falling as it has reached the 
            // potentially new tile.
            
            // Calculate a position from current sprites center to the center of one tile below and then floor the
            // value.
            var x: number = physics.currentlyMovingBody.x + (constant.TileSize.width / 2);
            var y: number = physics.currentlyMovingBody.y + (constant.TileSize.heigth * 1.5);
            var tile: Phaser.Tile = world.map.getTileWorldXY(x, y, constant.TileSize.width, 
                constant.TileSize.heigth, "collision");

            if (!tile && !anotherBodyUnder()) {
                // Falling
                findFirstTileUnderBody();
                physics.currentlyMovingBody.velocity.x = 0;
                physics.currentlyMovingBody.velocity.y = constant.Velocity * game.time.elapsed;
            } else {
                // Gravity does not apply and the body is not moving
                physics.currentlyMovingBody.velocity.x = physics.currentlyMovingBody.velocity.y = 0;
                physics.currentlyMovingBody.hasJustStarted = false;
                physics.currentlyMovingBody = undefined;
            }
        }
    }

}

export = physics;
