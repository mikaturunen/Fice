"use strict";

import player = require("../player/player");
import ice = require("../ice/ice");
import fires = require("../fires/fire");
import world = require("../world/tiles");
import constant = require("../utilities/constants");
import utilities = require("../utilities/utilities");

function killBodies(current: PhysicsBody, target: PhysicsBody) {
    if (current.tiledType === "FIRE") {
        target.isDead = true;
        current.isDead = target.tiledType === "ICE";
    }
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

/**
 * @module resolver
 * Super simple solver module for handling the different collision situations.
 * Phasers physics engine will take care of actual "what collides with what" and
 * resolving the situations, we just handle the results. Like what happens if
 * Player collides with Fire and such. We potentially will have to help it quite
 * a bit as we are aiming to go with that authentic old-school physics style of
 * the game we are remaking so... We'll see.
 */
module resolver {

    var currentBody: CollisionBody;
    var targetBody: CollisionBody;

    /**
     * Resolves Player collision with the target ice.
     * @param {Phaser.Sprite} player Player
     * @param {Phaser.Sprite} ice Ice
     */
    export function playerToIceCollision(player: Phaser.Sprite, ice: Phaser.Sprite) {
        console.log("Player colliding with Ice", player, ice);
        ice.body.velocity.x = player.body.velocity.x;
        player.body.velocity.x = 0;
    };

    /**
     * Resolves the situation where the Ice block overlaps an Fire block.
     */
    export function iceExtinguishesFire(ice: Phaser.Sprite, fire: Phaser.Sprite) {
        console.log("Ice is overlapping fire.");
        ice.kill();
        fire.kill();
    };

    /**
     * Resolves the situation where the Player runs into an fire block and dies.
     */
    export function playerDiesOnFire(playerSprite: Phaser.Sprite, fire: Phaser.Sprite) {
        console.log("Player dies on fire.");
        player.death();
    };

    export function buildCollisionBody(body: PhysicsBody) {
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
            _uniqueId: body._uniqueId,
            tiledType: body.tiledType
        };
    }
   
    export function resolveCollision(
            current: PhysicsBody, 
            target: PhysicsBody
        ) {

        currentBody = resolver.buildCollisionBody(current);
        targetBody = resolver.buildCollisionBody(target);

        if (areBodiesOverlapping(currentBody, targetBody)) {
            return false;
        }

        if (currentBody._uniqueId === target._uniqueId || current._uniqueId === target._uniqueId) {
            console.log("Unique ids match: ", current, currentBody, target);
            return false;
        }

        // NOTE this is stupidly simple but enough for this game
        
        // Pull the bodies apart based on velocity
        if (utilities.isDirectionLeft(current) &&
            currentBody.tile.y === targetBody.tile.y) {
            console.log("LLL X,Y -- X,Y:", currentBody.tile.x,",", currentBody.tile.y,"--", targetBody.tile.x,",",targetBody.tile.y);
            // is moving from right to left, need to pull to right 
            current.x = targetBody.coordinates.x + targetBody.width;
            killBodies(current, target);
            return true;
        } else if(utilities.isDirectionRight(current) &&
            currentBody.tile.y === targetBody.tile.y) {

            console.log("RRR X,Y -- X,Y:", currentBody.tile.x,",", currentBody.tile.y,"--", targetBody.tile.x,",",targetBody.tile.y);
            // is moving from left to right, need to pull to right
            current.x = targetBody.coordinates.x - targetBody.width;
            return true;
        } else if(utilities.isDirectionDown(current) &&
            currentBody.tile.x === targetBody.tile.x &&
            current.y + currentBody.heigth >= targetBody.coordinates.y) {
            
            console.log("DDD X,Y -- X,Y:", currentBody.tile.x,",", currentBody.tile.y,"--", targetBody.tile.x,",",targetBody.tile.y);
            // is falling, need to pull up
            current.y = targetBody.coordinates.y - targetBody.heigth;
            return true;
        } 

        // No resolving required
        return false;
    }

}

export = resolver;
