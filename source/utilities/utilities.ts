
import constants = require("./constants");

/**
 * Creates a given type of Object from provided Type on Layer
 * @param {string} type - Type we are looking for
 * @param {string} layer - The layer we are peeking into
 * @param {any} tiledMapJson - Actual JSON of the Tiled output
 * @return {TiledObject[]} Objects created from the tile layer and the given type.
 */
function createFromType(type: string, layer: string, tiledMapJson: any): TiledObject[] {
    var results = <TiledObject[]> [ ];

    tiledMapJson.layers.forEach((tmpLayer: any) => {
        if (tmpLayer.name === layer) {
            // correct layer found
            tmpLayer.objects.forEach((object: any) => {
                if (object.type === type) {
                    // Phaser uses top left, Tiled bottom left so we have to adjust the y position, to equal phaser coordinates and to
                    // properly position the entities in Phaser we need to do Tiled.y - TileHeight = Phaser.y
                    object.y -= tileSizes.heigth;
                    results.push(object);
                }
            });
        }
    });

    return results;
};

/**
 * @module utilities
 * Utilities module for handling commonly used and repeatedly happening events in the game.
 */
module utilities {
    /**
     * Gets floored tile X coordinate from world coordinates (x / tiles width) * tile width.
     * @param {number} x The pixel space X coordinate
     * @returns {number} World coordinate floored to the closets tile coordinate
     */
    var getTileFlooredXWorldCoordinate = (x: number) => {
        return Math.floor(x / tileSizes.width) * constants.TileSize.width;
    };

    /**
     * Gets floored tile Y coordinate from world coordinates (y / tiles height) * tile height.
     * @param {number} y The pixel space Y coordinate
     * @returns {number} World coordinate floored to the closets tile coordinate
     */
    var getTileFlooredYWorldCoordinate = (y: number) => {
        return Math.floor(y / tileSizes.heigth) * constants.TileSize.heigth;
    };

    /**
     * Gets tile X coordinate from world coordinates (x / tiles width).
     * @param {number} x The pixel space X coordinate
     * @returns {number} Floored tile coordinate.
     */
    var getTileXFromWorldCoordinate = (x: number) => {
        return Math.floor(x / constants.TileSize.width);
    };

    /**
     * Gets tile Y coordinate from world coordinates (y / tiles height).
     * @param {number} y The pixel space Y coordinate
     * @returns {number} Floored tile coordinate.
     */
    var getTileYFromWorldCoordinate = (y: number) => {
        return Math.floor(y / constants.TileSize.heigth);
    };

    /**
     * Simply just hides the path for image assets. Makes it easier to build the paths everywhere.
     * @param {string} levelName Name of the level to load. Including the .json.
     */
    export function image(imageName: string): string {
        return constants.ImagesAssetDirectory + imageName;
    };

    /**
     * Simply just hides the path for level assets. Makes it easier to build the paths everywhere.
     * @param {string} levelName Name of the level to load. Including the .json.
     */
    export function level(levelName: string): string {
        return constants.LevelsAssetDirecoty + levelName;
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
     * Fills a given Phaser.Group with Sprites found from the Layer of provided Type.
     * @param {Phaser.Group} spriteGroup group to fill with Sprites
     * @param {string} type Type to find from layer. Inspects JSONs .type property on the layer
     * @param {string} layer Layer to find from the JSON data.
     * @param {number} frame What frame to use from tile sheet.
     * @param {Phaser.Game} game Game object from Phaser.
     */
    export function fillSpriteGroup(spriteGroup: Phaser.Group, type: string, layer: string, frame: number, game: any)  {
        createFromType(type, layer, lvlJson).forEach((obj: TiledObject) => {
            var position = getFlooredWorldCoordinateFromWorldCoordinates(obj.x, obj.y, tileSizes);
            var sprite: Phaser.Sprite = game.add.sprite(position.x, position.y, "items");
            // Enabling physics for the body
            game.physics.enable(sprite, Phaser.Physics.ARCADE);
            // Setting frame and body size for the physics
            sprite.frame = frame;
            sprite.body.setSize(32,32);
            // Adding it into the blocks group
            spriteGroup.add(sprite);
        });
    };
};

export = utilities;
