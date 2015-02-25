"use strict";

// NOTE All constants are exported with capital letter

/**
 * @module constants
 * Module for constants (hard-coded) values used by the game.
 */
module constants {
    var levelsDirectory: string = "levels/";
    var imagesDirectory: string = "images/"

    export var AssetDirectoryPath: string = "/assets/";

    /** @type {string} Generalized location for level assets. */
    export var LevelsAssetDirectory: string = constants.AssetDirectoryPath + levelsDirectory;

    /** @type {string} Generalized location for image assets. */
    export var ImagesAssetDirectory: string = constants.AssetDirectoryPath + imagesDirectory;

    /** @type {TileSize} Size of tiles in the game world. */
    export var TileSize: TileSize = { width: 32, heigth: 32 };

    /** @type {number} The constants velocity everything moves in the game. */
    export var Velocity: number = 0.035;

    /** @tpye {number} Velocity treshold - when something moves slower than this, it stops */
    export var VelocityTreshold: number = 0.25;

};

export = constants;
