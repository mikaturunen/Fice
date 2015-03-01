
import constant = require("../utilities/constants");
import utilities = require("../utilities/utilities");
import world = require("../world/tiles");

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
        console.log("overlap, stop");
        physics.stopCurrent();
    }
 
    physics.currentlyMovingBody.x += physics.currentlyMovingBody.velocity.x;
    physics.currentlyMovingBody.y += physics.currentlyMovingBody.velocity.y;

    // Stops the movement if the moving body has reached it's ending position
    if (!utilities.isDirectionDown(physics.currentlyMovingBody) && 
        physics.currentlyMovingBody.tiledType === "PLAYER" && 
        utilities.onNextPosition(physics.currentlyMovingBody))
        {

        console.log("Next position reached - stop");
        physics.stopCurrent();
        physics.currentlyMovingBody.x = physics.currentlyMovingBody.next.x;
        physics.currentlyMovingBody.y = physics.currentlyMovingBody.next.y;
    }
}

function findFirstTileUnderBody(body?: PhysicsBody) {
    var current: PhysicsBody = body ? body : physics.currentlyMovingBody;

    var x: number = Math.floor((current.x + constant.TileSize.width * 0.5) / constant.TileSize.width);
    var y: number = Math.floor(current.y / constant.TileSize.heigth);

    var tileY: number = recursiveFindFirstTileUnderBody(x, y + 1, 0) - 1;
    current.next.x = current.x;
    current.next.y = tileY * constant.TileSize.heigth;
}

function recursiveFindFirstTileUnderBody(x: number, y: number, recursion: number): number {
    if (world.map.getTile(x, y, "collision")) {
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

        if (transferForce) {
            transferVelocity(targetBody);
            physics.stopCurrentAndSwap(targetBody);
        } else {
            physics.stopCurrent();
            console.log("Stop current!");
        }

        return true;
    }
    
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
    if (toResolveCurrent._uniqueId === target._uniqueId || toResolve._uniqueId === target._uniqueId) {
        console.log("Unique ids match: ", toResolve, toResolveCurrent, target);
        return false;
    }

    // NOTE this is stupidly simple but enough for this game
    
    // Pull the bodies apart based on velocity
    if (utilities.isDirectionLeft(toResolve) &&
        toResolveCurrent.tile.y === target.tile.y) {
        console.log("TTT ", toResolveCurrent, target);
        // is moving from right to left, need to pull to right 
        toResolve.x = target.coordinates.x + target.width;
        return true;
    } else if(utilities.isDirectionRight(toResolve) &&
        toResolveCurrent.tile.y === target.tile.y) {

        // is moving from left to right, need to pull to right
        toResolve.x = target.coordinates.x - target.width;
        return true;
    } else if(utilities.isDirectionDown(toResolve) &&
        toResolveCurrent.tile.x === target.tile.x &&
        toResolve.y + toResolveCurrent.heigth >= target.coordinates.y) {
        
        // is falling, need to pull up
        toResolve.y = target.coordinates.y - target.heigth;
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
        target.next.x = Math.round((targetX - 1) * constant.TileSize.width)
        physics.currentlyMovingBody.x = target.x + constant.TileSize.width;
    } else if (target.velocity.x >= constant.VelocityTreshold) {
        // Moving Right
        target.next.x = Math.round((targetX + 1) * constant.TileSize.width)
        physics.currentlyMovingBody.x = target.x - constant.TileSize.width;
    }
}

function buildCollisionBody(body: PhysicsBody) {
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
            findFirstTileUnderBody(potentiallyFallingBody);
            newMovingBody = potentiallyFallingBody;
            console.log("Gravity pulls new body: " + newMovingBody._uniqueId);
            newMovingBody.velocity.x = 0;
            newMovingBody.velocity.y = constant.Velocity * game.time.elapsed;
        }
    });
    
    return newMovingBody;
};

function canFallTile(target: PhysicsBody) {
    var body = buildCollisionBody(target);
    var tile = world.getTilePixelXY(body.coordinates.x, body.coordinates.y + constant.TileSize.heigth);
    var canFall: boolean = tile ? false : true;
    return  canFall;
}

function canFallBody(target: PhysicsBody) {
    var body = buildCollisionBody(target);
    var canFall: boolean = true;

    // go down one 
    body.tile.y += 1;

    physics.physicsBodies.forEach(target => {
        var targetBody: CollisionBody = buildCollisionBody(target);
        if (body.tile.x === targetBody.tile.x && body.tile.y === targetBody.tile.y) {
            // We have a body under, not allowed to fall
            canFall = false;
        } 
    });

    return canFall;
}

function pointInside(x: number, y: number, target: PhysicsBody) {
    var body = buildCollisionBody(target);
    var rect = new Phaser.Rectangle(body.coordinates.x, body.coordinates.y, 32, 32);
    
    return Phaser.Rectangle.contains(rect, x, y);
}

module physics {
    
    export var currentlyMovingBody: PhysicsBody;

    /** @type {Phaser.Physics.Arcade.Body[]} Set of bodies the Games physics affect */
    export var physicsBodies: PhysicsBody[] = [];

    export function stopCurrent() {
        physics.currentlyMovingBody.velocity.x = physics.currentlyMovingBody.velocity.y = 0;
    }

    export function getBody(x: number, y: number) {
        var body: any;

        physics.physicsBodies.forEach(target => {
            if (!body && pointInside(x, y, target)) {
                body = target;
            }
        });

        return body;
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
        // from bottom to top from the screens perspective and the "one object at a time"-login works and that's how
        // the items fall in the original so :o
        physics.physicsBodies = utilities.sortIntoAscendingYOrder(physics.physicsBodies);

        // Check collisions against other physics Bodies and see if the force is translated to another body
        physics.physicsBodies.forEach((targetBody: PhysicsBody) => {
            // Skip self -- Body cannot collide with itself, at least not for now ;)
            if (!physics.currentlyMovingBody || physics.currentlyMovingBody === targetBody) {
                return;
            } else if (!areBodiesOverlapping(buildCollisionBody(physics.currentlyMovingBody), buildCollisionBody(targetBody))) {
                return;
            }

            if (checkCollision(targetBody)) {
                console.log(
                        "Collision between bodies:", 
                        physics.currentlyMovingBody.tiledType, 
                        physics.currentlyMovingBody._uniqueId, 
                        targetBody._uniqueId, 
                        targetBody.velocity.x
                    );
                console.log("Current:", Math.round(physics.currentlyMovingBody.x / 32), ", ", Math.round(physics.currentlyMovingBody.y / 32), physics.currentlyMovingBody._uniqueId);
                console.log("Target :", Math.round(targetBody.x / 32), ", ", Math.round(targetBody.y / 32), targetBody._uniqueId);
            }
        });

        if (physics.currentlyMovingBody) {
            move();
            
            if (!isMoving()) {
                physics.currentlyMovingBody = undefined;
            }
        }

        // When no body is in motion, try finding a body we can put into motion through gravity
        if (!physics.currentlyMovingBody) {
            physics.physicsBodies.forEach(target => {
                if (!physics.currentlyMovingBody && canFallTile(target) && canFallBody(target)) {
                    // The target body has nothing under it, we can make it fall - no body or tile blocking 
                    physics.currentlyMovingBody = target;
                    physics.currentlyMovingBody.velocity.y = constant.Velocity * game.time.elapsed;
                    physics.currentlyMovingBody.velocity.x = 0;

                    console.log("BODY FOUND : " + physics.currentlyMovingBody._uniqueId, physics.currentlyMovingBody.tiledType, physics.currentlyMovingBody.velocity);
                }
            });
        }
    }

}

export = physics;
