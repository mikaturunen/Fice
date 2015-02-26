
import player = require("../player/player");

function isMoving(sprite: Phaser.Sprite) {
    return  sprite.body.velocity.x >=  constant.VelocityTreshold || 
            sprite.body.velocity.x <= -constant.VelocityTreshold ||
            sprite.body.velocity.y >=  constant.VelocityTreshold ||
            sprite.body.velocity.y <= -constant.VelocityTreshold;
}

function move(sprite: Phaser.Sprite) {
    sprite.body.x += sprite.body.velocity.x;
    sprite.body.y += sprite.body.velocity.y;

    if (utilities.onNextPosition(sprite.body.velocity, sprite.body, sprite.body.next)) {
        sprite.body.velocity.x = sprite.body.velocity.y = 0;
    }
}

module physics {
    
    export var isMovingBodies: boolean = false;

    export function update(game: Phaser.Game) {
        if (!isMovingBodies) {
            // Early quit - as we work on "one thing can move at a time" type of distinction
            // we can abuse it like this too, no need to perform any checks if everything's stopped ;)
            return;
        }

        move(player.sprite);
        
        // TODO move other entities too
        
        // TODO check has everyone stopped and then set moving bodies to false
        if (!isMoving(player.sprite)) {
            isMovingBodies = false;
        }
    }

}

export = physics;
