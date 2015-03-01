
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

/** 
 * Finds Tile in the velocity direction and fixes position to it if overlapping
 */
function getAndResolveOverlappingTile() {
    if (utilities.isDirectionLeft(physics.currentlyMovingBody)) {
        return (() => {
            var x = Math.round(physics.currentlyMovingBody.x - physics.currentlyMovingBody.velocity.x);
            var y = Math.round(physics.currentlyMovingBody.y);
            var tile = world.map.getTileWorldXY(x, y, constant.TileSize.width, constant.TileSize.heigth, "collision");
            
            if (tile) {
                physics.currentlyMovingBody.x = (tile.x * constant.TileSize.width) + constant.TileSize.width;
            }
            return tile;
        })();
    } else if (utilities.isDirectionRight(physics.currentlyMovingBody)) {
        return (() => {
            var x = Math.round(physics.currentlyMovingBody.x + constant.TileSize.width + physics.currentlyMovingBody.velocity.x);
            var y = Math.round(physics.currentlyMovingBody.y);
            var tile =  world.map.getTileWorldXY(x, y, constant.TileSize.width, constant.TileSize.heigth, "collision");
            
            if (tile) {
                physics.currentlyMovingBody.x = (tile.x * constant.TileSize.width) - constant.TileSize.width;
            }
            return tile;
        })();
    } else if (utilities.isDirectionDown(physics.currentlyMovingBody)) {
        return (() => {
            var x = Math.round(physics.currentlyMovingBody.x);
            var y = Math.round(physics.currentlyMovingBody.y + constant.TileSize.heigth + physics.currentlyMovingBody.velocity.y);
            var tile = world.map.getTileWorldXY(x, y, constant.TileSize.width, constant.TileSize.heigth, "collision");
        
            if (tile) {
                physics.currentlyMovingBody.y = (tile.y * constant.TileSize.heigth) - constant.TileSize.heigth;
            }
            return tile;
        })();
    }

    return undefined;
}

function isMoving() {
    return  physics.currentlyMovingBody.velocity.x >=  constant.VelocityTreshold || 
            physics.currentlyMovingBody.velocity.x <= -constant.VelocityTreshold ||
            physics.currentlyMovingBody.velocity.y >=  constant.VelocityTreshold ||
            physics.currentlyMovingBody.velocity.y <= -constant.VelocityTreshold;
}

function move() {
    var tile = getAndResolveOverlappingTile();
    if (tile) {
        physics.stopCurrent();
        return;
    }
 
    physics.currentlyMovingBody.x += physics.currentlyMovingBody.velocity.x;
    physics.currentlyMovingBody.y += physics.currentlyMovingBody.velocity.y;

    // Stops the movement if the moving body has reached it's ending position
    if (physics.currentlyMovingBody.tiledType === "PLAYER" && utilities.onNextPosition(physics.currentlyMovingBody)) {
        console.log("body reached position: ", physics.currentlyMovingBody, physics.currentlyMovingBody.next);
        physics.stopCurrent();
        physics.currentlyMovingBody.x = physics.currentlyMovingBody.next.x;
        physics.currentlyMovingBody.y = physics.currentlyMovingBody.next.y;
    }
}

function isFallingOverlap(collisionBody: CollisionBody) {
    if ( (physics.currentlyMovingBody.y + collisionBody.heigth) >= collisionBody.coordinates.y) {
        return true;
    }
}

function findFirstTileUnderBody(body?: PhysicsBody) {
    var current: PhysicsBody = body ? body : physics.currentlyMovingBody;

    var x: number = Math.floor((current.x + constant.TileSize.width * 0.5) / constant.TileSize.width);
    var y: number = Math.floor(current.y / constant.TileSize.heigth);

    console.log("x, y: ", x, y + 1);
    var tileY: number = recursiveFindFirstTileUnderBody(x, y + 1, 0) - 1;
    current.next.x = current.x;
    current.next.y = tileY * constant.TileSize.heigth;
    console.log("Set the tile coordinates to be: ", tileY, ", ", current.next.y, current.tiledType);
}

function recursiveFindFirstTileUnderBody(x: number, y: number, recursion: number): number {
    if (world.map.getTile(x, y, "collision")) {
        console.log("Tile found below body on Y:", y - 1);
        return y;
    } else if (recursion > 50) {
        // Currently we do not support even as many tiles (heigth wise) so we'll just tell it to return undefined
        return undefined;
    }

    return recursiveFindFirstTileUnderBody(x, y + 1, recursion + 1);
}

/** 
 * Checks collision between two PhysicsBody objects. Current one being the one hitting target.
 * @param {PhysicsBody} current 
 * @param {PhysicsBody} target
 */
function checkCollision(targetBody: PhysicsBody) {
    if (targetBody._uniqueId === physics.currentlyMovingBody._uniqueId) {
        return false;
    }

    var transferForce: boolean = false;

    if(physics.currentlyMovingBody.tiledType === "PLAYER") {
        transferForce = true;
    }

    var current: CollisionBody = buildCollisionBody(physics.currentlyMovingBody);
    var target: CollisionBody = buildCollisionBody(targetBody);

    // Physics bodies
    if (areBodiesOverlapping(current, target) && resolveCollision(physics.currentlyMovingBody, current, target)) {
        console.log("Bodies overlap: ", current, target);
        
        if (transferForce) {
            transferVelocity(targetBody);
            physics.stopCurrentAndSwap(targetBody);
            console.log("Currently moving physics body swapped and previous stopped.");
        } else {
            console.log("Currently moving physics body stopped.");
            physics.stopCurrent();
        }

        return true;
    }

    // Tiles
    

    return false;
}

function areBodiesOverlapping(current: CollisionBody, target: CollisionBody) {
    if (current.coordinates.y > target.coordinates.y + target.heigth) {
        // current is UNDER the target box
        return false; 
    } 

    if (current.coordinates.y + current.heigth < target.coordinates.y) {
        return false;
        // Current is ABOVE the target box
    }

    if (current.coordinates.x > target.coordinates.x + target.heigth) {
        return false;
        // Current is on the RIGHT side of the target box
    }

    if (current.coordinates.x + current.width < target.coordinates.x) {
        return false; 
        // Currenty is on the LEFT side of the target box
    }

    // We are overlapping :{
    return true;
}

function resolveCollision(toResolve: PhysicsBody, toResolveCurrent: CollisionBody, target: CollisionBody) {
    // NOTE this is stupidly simple but enough for this game
    
    // Pull the bodies apart based on velocity
    if (toResolveCurrent.velocity.x <= -constant.VelocityTreshold &&
        toResolveCurrent.tile.y === target.tile.y) {
        console.log("TTT ", toResolveCurrent, target);
        // is moving from right to left, need to pull to right 
        toResolve.x = target.coordinates.x + target.width;
        return true;
    } else if(toResolveCurrent.velocity.x >= constant.VelocityTreshold &&
        toResolveCurrent.tile.y === target.tile.y) {

        // is moving from left to right, need to pull to right
        toResolve.x = target.coordinates.x - target.width;
        return true;
    } else if(toResolveCurrent.velocity.y >= constant.VelocityTreshold &&
        toResolveCurrent.tile.x === target.tile.x) {

        // is falling, need to pull up
        toResolve.y = target.coordinates.y - target.heigth;
        return true;
    } else if (toResolveCurrent.velocity.y <= -constant.VelocityTreshold &&
        toResolveCurrent.tile.x === target.tile.x) {

        // is going up, need to pull down
        toResolve.y = target.coordinates.y + target.heigth;
        return true;
    }

    // No resolving required
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
        physics.currentlyMovingBody.x = target.x + constant.TileSize.width;
    } else if (target.velocity.x >= constant.VelocityTreshold) {
        // Moving Right
        console.log("Force right -- ", physics.currentlyMovingBody.velocity.x, target.velocity.x);
        target.next.x = Math.round((targetX + 1) * constant.TileSize.width)
        physics.currentlyMovingBody.x = target.x - constant.TileSize.width;
    }
}

function findBodyToFallOn() {
    var body = getBodyBelow();
    var tileY: number;
    var tileX: number;

    if (!body) {
        var tileY: number = getTileBelow();
        var tileX: number = Math.floor((physics.currentlyMovingBody.x + constant.TileSize.width * 0.5) / constant.TileSize.width);
    }

    if (!tileY && !body) {
        return undefined;
    }

    var x = body ? body.x : tileX * constant.TileSize.width;
    var y = body ? body.y : tileY * constant.TileSize.heigth;

    return <CollisionBody> {
        tile: {  
            x: Math.round(x / constant.TileSize.width),
            y: Math.round(y / constant.TileSize.heigth)
        },
        coordinates: {
            x: x,
            y: y,
        },
        width: constant.TileSize.width,
        heigth: constant.TileSize.heigth
    };
}

function buildCollisionBody(body: PhysicsBody) {
    return <CollisionBody> {
        tile: {  
            x: Math.round(body.x / constant.TileSize.width),
            y: Math.round(body.y / constant.TileSize.heigth)
        },
        coordinates: {
            x: body.x,
            y: body.x,
        },
        velocity: {
            x: body.velocity.x,
            y: body.velocity.y
        },
        width: constant.TileSize.width,
        heigth: constant.TileSize.heigth
    };
}

function getTileBelow() {
    var current: PhysicsBody = physics.currentlyMovingBody;
    var x: number = Math.floor((current.x + constant.TileSize.width * 0.5) / constant.TileSize.width);
    var y: number = Math.floor(current.y / constant.TileSize.heigth);
    return recursiveFindFirstTileUnderBody(x, y + 1, 0);
}

function getBodyBelow(body?: PhysicsBody) {
    var isBodyUnder: PhysicsBody;

    var current: PhysicsBody = body ? body : physics.currentlyMovingBody;

    physics.physicsBodies.forEach((target: PhysicsBody) => {
        if (isBodyUnder || current === target) {
            return;
        }

        var currentX: number = Math.round(current.x / constant.TileSize.width);
        var currentY: number = Math.round(current.y / constant.TileSize.heigth);
        var targetY: number  = Math.round(target.y / constant.TileSize.heigth);
        var targetX: number  = Math.round(target.x / constant.TileSize.width);

        if (currentY + 1 === targetY && currentX === targetX) {
            isBodyUnder = target;
        }
    });

    current.____isOnTopOfBody = isBodyUnder ? true : false;
    return isBodyUnder;
}

function findNewCurrentlyMovingBodyThroughGravity(game: Phaser.Game) {
    var newMovingBody: PhysicsBody;

    physics.physicsBodies.forEach(potentiallyFallingBody => {
        if(newMovingBody) {
            return;
        }

        // Calculate a position from current sprites center to the center of one tile below and then floor the
        // value.
        var x: number = potentiallyFallingBody.x + (constant.TileSize.width / 2);
        var y: number = potentiallyFallingBody.y + (constant.TileSize.heigth * 1.5);
        var tile: Phaser.Tile = world.map.getTileWorldXY(x, y, constant.TileSize.width, 
            constant.TileSize.heigth, "collision");

        if (!tile && !getBodyBelow(potentiallyFallingBody)) {
            // Falling
            console.log("Body falling..", Math.round(potentiallyFallingBody.y/32), " - ", potentiallyFallingBody.tiledType);
            findFirstTileUnderBody(potentiallyFallingBody);
            newMovingBody = potentiallyFallingBody;
            newMovingBody.velocity.x = 0;
            newMovingBody.velocity.y = constant.Velocity * game.time.elapsed;
        }
    });
    
    return newMovingBody;
};

module physics {
    
    export var currentlyMovingBody: PhysicsBody;

    /** @type {Phaser.Physics.Arcade.Body[]} Set of bodies the Games physics affect */
    export var physicsBodies: PhysicsBody[] = [];

    export function stopCurrent() {
        physics.currentlyMovingBody.velocity.x = physics.currentlyMovingBody.velocity.y = 0;
    }

    export function stopCurrentAndSwap(newCurrentlyMovingBody: PhysicsBody) {
        // Stop current body first
        var previousMovingBody = physics.currentlyMovingBody;
        physics.stopCurrent();
        // Set the new body to be the new currently moving body <3
        physics.currentlyMovingBody = newCurrentlyMovingBody;
        return previousMovingBody;
    }

    export function update(game: Phaser.Game) {
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
            if (!physics.currentlyMovingBody || physics.currentlyMovingBody === targetBody) {
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
                console.log("Current:", Math.round(physics.currentlyMovingBody.x / 32), ", ", Math.round(physics.currentlyMovingBody.y / 32), physics.currentlyMovingBody._uniqueId);
                console.log("Target :", Math.round(targetBody.x / 32), ", ", Math.round(targetBody.y / 32), targetBody._uniqueId);
            }
        });

        physics.currentlyMovingBody = physics.currentlyMovingBody || findNewCurrentlyMovingBodyThroughGravity(game);

        if (!physics.currentlyMovingBody) {
            return;
        }

        // Essentially moves the body and checks if it needs to stop after reaching it's "next" position / hit a 
        // blocking tile.
        move();

        if (!physics.currentlyMovingBody) {
            return;
        }

        // The body has gone through at least ONE physics cycle, we no longer consider it to just have started
        // moving 
        physics.currentlyMovingBody.hasJustStarted = false;
        if (!isMoving()) {
            physics.currentlyMovingBody = undefined;
        }
    }

}

export = physics;
