
interface PhysicsBody extends Phaser.Physics.Arcade.Body {
    /** @type {Phaser.Point} Points towards the physics body is moving (next tile, floored) */
    next: Phaser.Point;

    /** @type {Phaser.Point} Points physics body left from when going for .next (previous tile, floored) */
    previous: Phaser.Point;

    /** @type {string} Body type */
    tiledType: string;

    /** @type {boolean} Retro-remake velocity is always constant so we cannot use that to see did we just 
                        start moving. We'll use this to make our life easier. True when body starts moving
                        and false once it has gone through one cycle of physics.update so it's no longer "fresh" */
    hasJustStarted: boolean;

    // DEBUG
    ____isOnTopOfBody: boolean;
}