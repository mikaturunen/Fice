
import constant = require("../utilities/constants");
import utilities = require("../utilities/utilities");

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
    }
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
                movingBodies.push(body);
            }
        });
        
        physics.isMovingBodies = movingBodies.length > 0;
    }

}

export = physics;
