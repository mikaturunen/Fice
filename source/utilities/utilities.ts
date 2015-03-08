
import constant = require("./constants");
import world = require("../world/tiles");

/**
 * @module utilities
 * Utilities module for handling commonly used and repeatedly happening events in the game.
 */
module utilities {
    var runningId: number = 0;

    export function getRunningId() {
        runningId += 1;
        return runningId;
    }

    export function sortIntoAscendingYOrder(physicsBodies: PhysicsBody[]) {
        return physicsBodies.sort((l: PhysicsBody, r: PhysicsBody) => { 
            if (l.y < r.y) {
                return 1;
            } else if (l.y > r.y) {
                return -1;
            }
            return 0;
        });
    }

    export function floorToWorldTileCoordinate(value: number) {
        return Math.floor( value / constant.TileSize.width ) * constant.TileSize.width;
    }

    export function isDirectionLeft(body: PhysicsBody) {
        return body.velocity.x <= -constant.VelocityTreshold;
    }

    export function isDirectionRight(body: PhysicsBody) {
        return body.velocity.x >= constant.VelocityTreshold;
    }

    export function isDirectionDown(body: PhysicsBody) {
        return body.velocity.y >= constant.VelocityTreshold;
    }

    export function onNextPosition(body: PhysicsBody) {
        if (body.velocity.x > 0) {
            // Moving right
            return body.x >= body.next.x;
        } else if (body.velocity.x < 0) {
            // Moving left
            return body.x <= body.next.x;
        } else if (body.velocity.y > 0) {
            // Falling down
            return (body.y) >= body.next.y;
        }

        return false;
    }

    /**
     * Simply just hides the path for image assets. Makes it easier to build the paths everywhere.
     * @param {string} levelName Name of the level to load. Including the .json.
     */
    export function image(imageName: string): string {
        return constant.ImagesAssetDirectory + imageName;
    };

    /**
     * Simply just hides the path for level assets. Makes it easier to build the paths everywhere.
     * @param {string} levelName Name of the level to load. Including the .json.
     */
    export function level(levelName: string): string {
        return constant.LevelsAssetDirectory + levelName;
    };

    /**
     * Creates a Sprite object from the given element.
     * @param {any} element - element
     * @param {any} group - Group to associate the newly created Sprite with
     */
    export function createSprite(element: any, group: any): any {
        var sprite = group.create(element.x, element.y, element.properties.sprite);

        //copy all properties to the sprite
        Object.keys(element.properties).forEach((key: string) => {
            sprite[key] = element.properties[key];
        });
    };


    /**
     * Creates a given type of Object from provided Type on Layer
     * @param {string} type - Type we are looking for
     * @param {string} layer - The layer we are peeking into
     * @param {any} tiledMapJson - Actual JSON of the Tiled output
     * @return {TiledObject[]} Objects created from the tile layer and the given type.
     */
    export function createFromType(type: string, layer: string, tiledMapJson: any): TiledObject[] {
        var results = <TiledObject[]> [ ];

        tiledMapJson.layers.forEach((tmpLayer: any) => {
            if (tmpLayer.name === layer) {
                // correct layer found
                tmpLayer.objects.forEach((object: any) => {
                    if (object.type === type) {
                        // Phaser uses top left, Tiled bottom left so we have to adjust the y position, to equal phaser coordinates and to
                        // properly position the entities in Phaser we need to do Tiled.y - TileHeight = Phaser.y
                        object.y -= constant.TileSize.heigth;
                        results.push(object);
                    }
                });
            }
        });

        return results;
    };

    export function isInTresholdConstrain(pixelPositionOrVelocity: number, target: number) {
        return pixelPositionOrVelocity <= (target + constant.VelocityTreshold) && 
            pixelPositionOrVelocity >= (target - constant.VelocityTreshold);
    }

    /**
     * Fills a given Phaser.Group with Sprites found from the Layer of provided Type.
     * @param {Phaser.Group} spriteGroup group to fill with Sprites
     * @param {string} type Type to find from layer. Inspects JSONs .type property on the layer
     * @param {string} layer Layer to find from the JSON data.
     * @param {number} frame What frame to use from tile sheet.
     * @param {Phaser.Game} game Game object from Phaser.
     */
    export function fillSpriteGroup(spriteGroup: Phaser.Group, type: string, layer: string, frame: number, game: any)  {
        createFromType(type, layer, world.currentLevelJson).forEach((obj: TiledObject) => {
            var x: number = utilities.floorToWorldTileCoordinate(obj.x);
            var y: number = utilities.floorToWorldTileCoordinate(obj.y);
            var sprite: Phaser.Sprite = game.add.sprite(x, y, "items");
            // Enabling physics for the body
            game.physics.enable(sprite, Phaser.Physics.ARCADE);
            // Setting frame and body size for the physics
            sprite.frame = frame;
            sprite.body.setSize(constant.TileSize.width, constant.TileSize.heigth);
            // Adding it into the blocks group
            sprite.name = type;
            sprite.z = 1000;
            spriteGroup.add(sprite);
        });
    };
};

export = utilities;
