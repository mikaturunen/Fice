
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

function move(game: Phaser.Game) {
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
        utilities.onNextPosition(physics.currentlyMovingBody)) {

        // PLAYER reached end of position
        console.log("Next position reached - stop");
        physics.stopCurrent();
        // TODO because of the below lines the movement is jerky! FIX!
        physics.currentlyMovingBody.x = physics.currentlyMovingBody.next.x;
        physics.currentlyMovingBody.y = physics.currentlyMovingBody.next.y;
    } else if (!utilities.isDirectionDown(physics.currentlyMovingBody) && 
        utilities.onNextPosition(physics.currentlyMovingBody)) {

        // Entity reached next position, check if falls and otherwise recalculate new next
         // TODO because of the below lines the movement is jerky! FIX!
        physics.currentlyMovingBody.x = physics.currentlyMovingBody.next.x;
        physics.currentlyMovingBody.y = physics.currentlyMovingBody.next.y;
        

        if (canFallTile(physics.currentlyMovingBody) && canFallBody(physics.currentlyMovingBody)) {
            // Gravity can pull the current body down
            console.log("Current body started falling..");
            physics.currentlyMovingBody.velocity.y = constant.Velocity * game.time.elapsed;
            physics.currentlyMovingBody.velocity.x = 0;
            physics.currentlyMovingBody.y += physics.currentlyMovingBody.velocity.y;
        } else {
            console.log("Calculating new next for body..");
            calculateNextForBody(physics.currentlyMovingBody);
        }
    }
}

function calculateNextForBody(body: PhysicsBody) {
    var targetCollisionBody: CollisionBody = buildCollisionBody(body);

    // which direction to place the next position at
    if (utilities.isDirectionRight(body)) {
        body.next.x = (targetCollisionBody.tile.x + 1) * constant.TileSize.width;
        body.next.y = targetCollisionBody.coordinates.y;
        console.log("Calculating next for body moving right..", body.next.x);
    } else if (utilities.isDirectionLeft(body)) {
        body.next.x = (targetCollisionBody.tile.x - 1) * constant.TileSize.width;
        body.next.y = targetCollisionBody.coordinates.y;
        console.log("Calculating next for body moving left..", body.next.x);
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
    if (!physics.currentlyMovingBody || 
        targetBody._uniqueId === physics.currentlyMovingBody._uniqueId) {

        return false;
    }

    var current: CollisionBody = buildCollisionBody(physics.currentlyMovingBody);
    var target: CollisionBody = buildCollisionBody(targetBody);

    // Physics bodies
    if (areBodiesOverlapping(current, target) && resolveCollision(physics.currentlyMovingBody, current, target)) {
        killBodies(physics.currentlyMovingBody, targetBody);
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

function killBodies(current: PhysicsBody, target: PhysicsBody) {
    if (current.tiledType === "PLAYER" || current.tiledType === "ICE") {
        if (target.tiledType === "FIRE") {
            current.isDead = true;
            target.isDead = current.tiledType === "ICE";
            console.log("FIRE FOUND", target.tiledType);
        }
    }
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

        console.log("LLL X,Y -- X,Y:", toResolveCurrent.tile.x,",", toResolveCurrent.tile.y,"--", target.tile.x,",",target.tile.y);
        // is moving from right to left, need to pull to right 
        toResolve.x = target.coordinates.x + target.width;
        return true;
    } else if(utilities.isDirectionRight(toResolve) &&
        toResolveCurrent.tile.y === target.tile.y) {

        console.log("RRR X,Y -- X,Y:", toResolveCurrent.tile.x,",", toResolveCurrent.tile.y,"--", target.tile.x,",",target.tile.y);
        // is moving from left to right, need to pull to right
        toResolve.x = target.coordinates.x - target.width;
        return true;
    } else if(utilities.isDirectionDown(toResolve) &&
        toResolveCurrent.tile.x === target.tile.x &&
        toResolve.y + toResolveCurrent.heigth >= target.coordinates.y) {
        
        console.log("DDD X,Y -- X,Y:", toResolveCurrent.tile.x,",", toResolveCurrent.tile.y,"--", target.tile.x,",",target.tile.y);
        // is falling, need to pull up
        toResolve.y = target.coordinates.y - target.heigth;
        return true;
    } 

    // No resolving required
    return false;
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
            // If it's fire, we allow other bodies to fall on it and DIE!
            if (target.tiledType !== "FIRE") {
                // We have a body under, not allowed to fall
                canFall = false;
            } 
        } 
    });

    return canFall;
}

function pointInside(x: number, y: number, target: PhysicsBody) {
    var body = buildCollisionBody(target);
    var rect = new Phaser.Rectangle(body.coordinates.x, body.coordinates.y, 32, 32);
    
    return Phaser.Rectangle.contains(rect, x, y);
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

function getIceBodiesGroupByY(iceBodies: PhysicsBody[]) {
    var groups: PhysicsBody[][] = [];

    for (var y = 0; y < constant.TotalTilesY; y++) {
        var group = iceBodies.filter(i => buildCollisionBody(i).tile.y === y);

        if (group.length > 0) {
            groups.push(group);
        }
    }

    return groups;
}

function canFall(target: PhysicsBody) {
    if(canFallTile(target) && canFallBody(target)) {
        return true;
    }

    return false;
}

module physics {
    // Generally we allow only one body to move at a time 
    export var currentlyMovingBody: PhysicsBody;
    // Ice bodies are different, they can "combine" and move as one
    export var currentlyIceBodies: PhysicsBody[] = [];

    /** @type {Phaser.Physics.Arcade.Body[]} Set of bodies the Games physics affect */
    export var physicsBodies: PhysicsBody[] = [];

    export function killBody(body: PhysicsBody) {
        physics.physicsBodies = physics.physicsBodies.filter(b => b._uniqueId !== body._uniqueId);
    }

    export function killBodies(bodies: number[]) {
        console.log("Current bodies:", physicsBodies.length);
        physics.physicsBodies = physics.physicsBodies.filter(b => bodies.indexOf(b._uniqueId) === -1);
        console.log("Current bodies after removal:", physicsBodies.length);
    }

    export function stopCurrent() {
        if (!physics.currentlyMovingBody) {
            return;
        }

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
        physics.stopCurrent();
        // Set the new body to be the new currently moving body <3
        physics.currentlyMovingBody = newCurrentlyMovingBody;
    }

    export function update(game: Phaser.Game) {
        // Sort the bodies into an order where the first is the one with the highest Y, so we start applying physics
        // from bottom to top from the screens perspective and the "one object at a time"-login works and that's how
        // the items fall in the original so :o
        physics.physicsBodies = utilities.sortIntoAscendingYOrder(physics.physicsBodies);

        if (physics.currentlyMovingBody) {
            move(game);

            if (!isMoving()) {
                physics.currentlyMovingBody = undefined;
            }
        }

        // When no body is in motion, try finding a body we can put into motion through gravity
        if (!physics.currentlyMovingBody && physics.currentlyIceBodies.length === 0) {
            console.log("TEST");
            var iceBodies: PhysicsBody[] = physics.physicsBodies.filter(b => b.tiledType === "ICE");
            var otherBodies: PhysicsBody[] = physics.physicsBodies.filter(b => b.tiledType !== "ICE");

            // Iterate ice blocks and see if they will start falling
            var iceGroups: PhysicsBody[][] = getIceBodiesGroupByY(iceBodies);
            iceGroups.forEach((iceBodiesOnSameLevel: PhysicsBody[]) => {
                console.log("contains tiles:", iceBodiesOnSameLevel.length);
                // TODO connect bodies
                if (iceBodiesOnSameLevel.every(canFall)) {
                    console.log("ICE BLOCK ON SAME LEVEL CAN DROP :D:D:D", iceBodiesOnSameLevel.length);
                }
            });

            // No ice blocks moving
            if (currentlyIceBodies.length <= 0) {
                // Iterate rest of the bodies
                otherBodies.forEach(target => {
                    if (!physics.currentlyMovingBody && canFall(target)) {
                        // The target body has nothing under it, we can make it fall - no body or tile blocking 
                        physics.stopCurrentAndSwap(target);
                        physics.currentlyMovingBody.velocity.y = constant.Velocity * game.time.elapsed;
                        physics.currentlyMovingBody.y += physics.currentlyMovingBody.velocity.y;
                        physics.currentlyMovingBody.velocity.x = 0;

                        console.log("BODY FOUND : " + physics.currentlyMovingBody._uniqueId, physics.currentlyMovingBody.tiledType, physics.currentlyMovingBody.velocity);
                    }
                });
            } 
        }

        for (var index: number = 0; index < physics.physicsBodies.length; index++) {
            var targetBody: PhysicsBody = physics.physicsBodies[index];

            if (checkCollision(targetBody)) {
                console.log("Collision between body id's:", physics.currentlyMovingBody._uniqueId, targetBody._uniqueId);

                console.log("Current:", Math.round(physics.currentlyMovingBody.x / 32), ",", Math.round(physics.currentlyMovingBody.y / 32), physics.currentlyMovingBody._uniqueId);
                console.log("Target :", Math.round(targetBody.x / 32), ",", Math.round(targetBody.y / 32), targetBody._uniqueId);

                if (physics.currentlyMovingBody.tiledType === "PLAYER" && targetBody.tiledType === "ICE") {
                    targetBody.velocity.x = physics.currentlyMovingBody.velocity.x;
                    calculateNextForBody(targetBody);
                }

                physics.stopCurrentAndSwap(targetBody);
                return;
            }
        }

        if (physics.currentlyMovingBody && physics.currentlyMovingBody.isDead) {
            physics.currentlyMovingBody = undefined;
        }
    }

    /** 
     * Is PhysicsBody moving. 
     * @param {PhysicsBody} [body= physics.currentlyMovingBody] The body to check for movement
     * @returns {boolean} true when it has velocity over treshold.
     */
    export function isMoving(body?: PhysicsBody) {
        var b = body ? body : physics.currentlyMovingBody;

        return  utilities.isDirectionRight(b) || utilities.isDirectionLeft(b) ||
                utilities.isDirectionDown(b) || b.velocity.y <= -constant.VelocityTreshold;
    }
}

export = physics;
