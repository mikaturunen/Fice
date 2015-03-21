
import constant = require("../utilities/constants");
import utilities = require("../utilities/utilities");
import world = require("../world/tiles");
import collisionBody = require("./collision-body");
import resolve = require("./resolver");

/**
 * Tests if the body facing the given Tile can climb on top of it.
 * @param {PhysicsBody} body That collided with the tile
 * @param {Phaser.Tile} tile Tile the body collided with
 */
function canClimb(body: PhysicsBody, tile: Phaser.Tile) {
    // Combining all tiles and physics bodies into a single ball of a messy collision data
    var bodies = []
        .concat(collisionBody.fromPhysicsBodies(physics.physicsBodies))
        .concat(collisionBody.fromTiles(world.getAllTiles()));

    var aboveBody = collisionBody.isEmptyTop(collisionBody.fromPhysicsBody(body), bodies);
    var aboveTile = collisionBody.isEmptyTop(collisionBody.fromTile(tile), bodies);
    console.log("canClimb, above body empty", aboveBody, "above tile empty", aboveTile);
    return aboveBody && aboveTile;
}

/**
 * Moves the currently moving body in the wanted direction.
 * @param {Phaser.Game} game Game object from Phaser.
 * @param {PhysicsBody} current Currently moving PhysicsBody
 */
function move(game: Phaser.Game, current: PhysicsBody) {
    if (physics.currentlyMovingBodies.length <= 0) {
        return;
    }

    var tile = world.getTileBasedOnPositionAndDirection(current);
    if (tile) {

        if (canClimb(current, tile)) {
            console.log("CAN CLIMB AHOY! :D");
            current.x = tile.x * constant.TileSize.width;
            current.y = (tile.y - 1) * constant.TileSize.heigth;
        }
        console.log("overlap, stop");
        current.velocity.x = current.velocity.y = 0;
    }

    current.x += current.velocity.x;
    current.y += current.velocity.y;

    // Stops the movement if the moving body has reached it's ending position
    if (!constant.isDirectionDown(current.velocity.y) && 
        current.tiledType === "PLAYER" && 
        utilities.onNextPosition(current)) {

        // PLAYER reached end of position
        console.log("Next position reached - stop");
        current.velocity.x = current.velocity.y = 0;
        // TODO because of the below lines the movement is jerky! FIX!
        current.x = current.next.x;
        current.y = current.next.y;
    } else if (!constant.isDirectionDown(current.velocity.y) && 
        utilities.onNextPosition(current)) {

        // Entity reached next position, check if falls and otherwise recalculate new next
        // TODO because of the below lines the movement is jerky! FIX!
        current.x = current.next.x;
        current.y = current.next.y;
        
        if (canFallTile(current) && canFallBody(current)) {
            // Gravity can pull the current body down
            console.log("Current body started falling..");
            current.velocity.y = constant.Velocity * game.time.elapsed;
            current.velocity.x = 0;
            current.y += current.velocity.y;
        } else {
            console.log("Calculating new next for body..");
            calculateNextForBody(current);
        }
    }
}

function calculateNextForBody(body: PhysicsBody) {
    var targetCollisionBody: CollisionBody = collisionBody.fromPhysicsBody(body);

    // which direction to place the next position at
    if (constant.isDirectionRight(body.velocity.x)) {

        body.next.x = (targetCollisionBody.tile.x + 1) * constant.TileSize.width;
        body.next.y = targetCollisionBody.coordinates.y;
        console.log("Calculating next for body moving right..", (body.next.x/32));
    } else if (constant.isDirectionLeft(body.velocity.x)) {
        body.next.x = (targetCollisionBody.tile.x - 1) * constant.TileSize.width;
        body.next.y = targetCollisionBody.coordinates.y;
        console.log("Calculating next for body moving left..", body.next.x);
    }
}

/**
 * Finds the first tile under the current PhysicsBody
 * @param {PhysicsBody} current 
 */
function findFirstTileUnderBody(current: PhysicsBody) {
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
 * Tries to find a body below the current body
 * @param {PhysicsBody} current Current body
 * @returns {PhysicsBody} Returns a body when found
 */
function getBodyBelow(current: PhysicsBody) {
    var isBodyUnder: PhysicsBody;
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
    var body = collisionBody.fromPhysicsBody(target);
    var tile = world.getTilePixelXY(body.coordinates.x, body.coordinates.y + constant.TileSize.heigth);
    var canFall: boolean = tile ? false : true;
    return  canFall;
}

function canFallBody(current: PhysicsBody) {
    var body = collisionBody.fromPhysicsBody(current);
    var canFall: boolean = true;

    // go down one 
    body.tile.y += 1;

    physics.physicsBodies.forEach(target => {
        var targetBody: CollisionBody = collisionBody.fromPhysicsBody(target);
        if (body.tile.x === targetBody.tile.x && body.tile.y === targetBody.tile.y) {
            if (current.tiledType === "FIRE" && target.tiledType === "FIRE") {
                canFall = false;
            } else if (target.tiledType !== "FIRE") {
                // If it's fire, we allow other bodies to fall on it and DIE!
                // We have a body under, not allowed to fall
                canFall = false;
            } 
        } 
    });

    return canFall;
}

function pointInside(x: number, y: number, target: PhysicsBody) {
    var body = collisionBody.fromPhysicsBody(target);
    var rect = new Phaser.Rectangle(body.coordinates.x, body.coordinates.y, 32, 32);
    
    return Phaser.Rectangle.contains(rect, x, y);
}


function getIceBodiesGroupByY(iceBodies: PhysicsBody[]) {
    var groups: PhysicsBody[][] = [];

    for (var y = 0; y < constant.TotalTilesY; y++) {
        var group = iceBodies.filter(i => collisionBody.fromPhysicsBody(i).tile.y === y);

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

/**
 * Finds a body or bodies that can be put into motion through gravity. Requires the bodies to be in place. Mimics
 * Solomon's No Kagi 2's behavior as much as it can in this respect.
 * @param {Phaser.Game} game Game object from Phaser
 */
function applyGravityOnMotionlessBodies(game: Phaser.Game, current: PhysicsBody) {

    // When no body is in motion, try finding a body we can put into motion through gravity
   /* if (!physics.currentlyMovingBody && physics.currentlyIceBodies.length === 0) {
        var iceBodies: PhysicsBody[] = physics.physicsBodies.filter(b => b.tiledType === "ICE");
        var otherBodies: PhysicsBody[] = physics.physicsBodies.filter(b => b.tiledType !== "ICE");

        // Iterate ice blocks and see if they will start falling
        var iceGroups: PhysicsBody[][] = getIceBodiesGroupByY(iceBodies);
        iceGroups.forEach((iceBodiesOnSameLevel: PhysicsBody[]) => {
            // TODO connect bodies
            if (iceBodiesOnSameLevel.every(canFall)) {
                iceBodiesOnSameLevel.forEach(target => {
                    // The target body has nothing under it, we can make it fall - no body or tile blocking 
                    physics.stopCurrentAndSwap(target);
                    physics.currentlyMovingBody.velocity.y = constant.Velocity * game.time.elapsed;
                    physics.currentlyMovingBody.y += physics.currentlyMovingBody.velocity.y;
                    physics.currentlyMovingBody.velocity.x = 0;

                    console.log("ICE BODY FOUND : " + physics.currentlyMovingBody._uniqueId, physics.currentlyMovingBody.tiledType, physics.currentlyMovingBody.velocity);
                });
            }
        });

        // No ice blocks moving
        if (physics.currentlyIceBodies.length <= 0) {
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
    }*/
}

/**
 * Checks for collisions for all physics bodies.
 * @param {Phaser.Game} game Game object from Phaser.
 */
function checkCollisionForAllPhysicsBodies(game: Phaser.Game, current: PhysicsBody, index: number) {
    physics.physicsBodies.forEach((target: PhysicsBody, currentIndex: number) => {
        if (index === currentIndex) {
            // Skip the same indices
            return;
        }

        if (resolve.collision(current, target)) {
            console.log("Collision between body id's:", current._uniqueId, target._uniqueId);

            console.log("Current:", Math.round(current.x / 32), ",", Math.round(current.y / 32), current._uniqueId);
            console.log("Target :", Math.round(target.x / 32), ",", Math.round(target.y / 32), target._uniqueId);

            if (current.tiledType === "PLAYER" && target.tiledType === "ICE") {
                target.velocity.x = current.velocity.x;
                calculateNextForBody(target);
            }

            current.velocity.x = current.velocity.y = 0;
            console.log(current.tiledType);
        }
    });
}

module physics {
    export var currentlyMovingBodies: PhysicsBody[] = [];
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

    export function getBody(x: number, y: number) {
        var body: any;

        physics.physicsBodies.forEach(target => {
            if (!body && pointInside(x, y, target)) {
                body = target;
            }
        });

        return body;
    }

    export function update(game: Phaser.Game) {
        // TODO apply new velocity each loop with delta and THEN add it on body; currently add delta once and keep adding it to body (delta changes each time)


        // Sort the bodies into an order where the first is the one with the highest Y, so we start applying physics
        // from bottom to top from the screens perspective and the "one object at a time"-login works and that's how
        // the items fall in the original so :o
        utilities
            .sortIntoAscendingYOrder(physics.physicsBodies)
            .forEach((current: PhysicsBody, index: number) => {
                move(game, current);
                // applyGravityOnMotionlessBodies(game, current);
                checkCollisionForAllPhysicsBodies(game, current, index);
            });
    }

    /** 
     * Is PhysicsBody moving. 
     * @param {PhysicsBody} b The body to check for movement
     * @returns {boolean} true when it has velocity over treshold.
     */
    export function isMoving(b: PhysicsBody) {
        return  constant.isDirectionRight(b.velocity.x) || constant.isDirectionLeft(b.velocity.x) ||
                constant.isDirectionDown(b.velocity.y) || b.velocity.y <= -constant.VelocityTreshold;
    }

    export var areBodiesInMotion    = () => physicsBodies.filter(b => physics.isMoving(b)).length > 0;
    export var areIceBodiesInMotion = () => physicsBodies.filter(b => b.tiledType === "ICE" && physics.isMoving(b)).length > 0;
}

export = physics;
