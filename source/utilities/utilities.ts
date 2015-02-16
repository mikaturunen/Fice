
import constants = require("./constants");

/** 
 * @module utilities
 * Utilities module for handling commonly used and repeatedly happening events in the game.
 */
module utilities {
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
                        object.y -= tileSizes.heigth;
                        results.push(object);
                    }
                });
            }
        });

        return results;
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

};

export = utilities;
