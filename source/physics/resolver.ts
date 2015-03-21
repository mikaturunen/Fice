"use strict";

import player = require("../player/player");
import ice = require("../ice/ice");
import fires = require("../fires/fire");
import world = require("../world/tiles");
import collisionBody = require("./collision-body");
import constant = require("../utilities/constants");
import utilities = require("../utilities/utilities");

function killBodies(current: PhysicsBody, target: PhysicsBody) {
    if (current.tiledType === "PLAYER" || current.tiledType === "ICE") {
        if (target.tiledType === "FIRE") {
            current.isDead = true;
            target.isDead = current.tiledType === "ICE";
            console.log("FIRE FOUND", target.tiledType);
        }
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
  
    /**
     * Attempts to resolve the collision situation.
     * @param {PhysicsBody} current Body colliding
     * @param {PhysicsBody} target  Body collided with
     * @returns {boolean} True when collision resolving steps 
     */
    export function collision(
            current: PhysicsBody, 
            target: PhysicsBody
        ) {

        currentBody = collisionBody.fromPhysicsBody(current);
        targetBody = collisionBody.fromPhysicsBody(target);

        if (currentBody._uniqueId === target._uniqueId || current._uniqueId === target._uniqueId) {
            console.log("Unique ids match: ", current, currentBody, target);
            // Fow some reason body is trying to collide against itself, no collision
            return false;
        }

        if (!areBodiesOverlapping(currentBody, targetBody)) {
            // No collision
            return false;
        }

        var newPosition = pullBodiesApart(currentBody, targetBody); 
        collisionBody.setPosition(current, newPosition);       

        // Resolving required -- the bodies collided
        return true;
    }

    /**
     * Should only be called when it's already confirmed that the bodies are overlapping and require pulling apart.
     * Super simple CollisionBody collision resolver. Nothing too fancy.
     * @param {CollisionBody} current Body colliding. Gets pulled "out of" target.
     * @param {CollisionBody} target  Body being collided with.
     */
    export function pullBodiesApart(current: CollisionBody, target: CollisionBody)  {
        // Pull the bodies apart based on velocity
        if (constant.isDirectionLeft(current.velocity.x) &&
            current.tile.y === target.tile.y) {
            console.log("LLL X,Y -- X,Y:", current.tile.x,",", current.tile.y,"--", target.tile.x,",",target.tile.y);
            // is moving from right to left, need to pull to right 
            current.coordinates.x = target.coordinates.x + target.width;
        } else if(constant.isDirectionRight(current.velocity.x) &&
            current.tile.y === target.tile.y) {

            console.log("RRR X,Y -- X,Y:", current.tile.x,",", current.tile.y,"--", target.tile.x,",",target.tile.y);
            // is moving from left to right, need to pull to right
            current.coordinates.x = target.coordinates.x - target.width;
        } else if(constant.isDirectionDown(current.velocity.y) &&
            current.tile.x === target.tile.x &&
            current.coordinates.y + current.heigth >= target.coordinates.y) {
            
            console.log("DDD X,Y -- X,Y:", current.tile.x,",", current.tile.y,"--", target.tile.x,",",target.tile.y);
            // is falling, need to pull up
            current.coordinates.y = target.coordinates.y - target.heigth;
        } 

        return current;
    }
}

export = resolver;
