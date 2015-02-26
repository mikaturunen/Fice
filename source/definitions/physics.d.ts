
interface PhysicsBody extends Phaser.Physics.Arcade.Body {
    /** @type {Phaser.Point} Points towards the physics body is moving (next tile, floored) */
    next: Phaser.Point;
}