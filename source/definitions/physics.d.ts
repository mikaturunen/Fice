
interface PhysicsBody extends Phaser.Physics.Arcade.Body {
    /** @type {Phaser.Point} Points towards the physics body is moving (next tile, floored) */
    next: Phaser.Point;

    /** @type {Phaser.Point} Points physics body left from when going for .next (previous tile, floored) */
    previous: Phaser.Point;

    /** @type {string} Body type */
    tiledType: string;
}