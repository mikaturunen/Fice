"use strict";

// NOTE All constants are exported with capital letter

/**
 * @module constants
 * Module for constants (hard-coded) values used by the game.
 */
module constants {
    var levelsDirectory: string = "levels/";
    var imagesDirectory: string = "images/"

    export var TotalTilesY = 14;
    export var TotalTilesX = 16;

    export var AssetDirectoryPath: string = "/assets/";

    /** @type {string} Generalized location for level assets. */
    export var LevelsAssetDirectory: string = constants.AssetDirectoryPath + levelsDirectory;

    /** @type {string} Generalized location for image assets. */
    export var ImagesAssetDirectory: string = constants.AssetDirectoryPath + imagesDirectory;

    /** @type {TileSize} Size of tiles in the game world. */
    export var TileSize: TileSize = { width: 32, heigth: 32 };

    /** @type {number} The constants velocity everything moves in the game. */
    export var Velocity: number = 0.1;

    /** @tpye {number} Velocity treshold - when something moves slower than this, it stops */
    export var VelocityTreshold: number = 0.25;

    // NOTE using the var declaration for 'export function <name>()' instead here as it allows us to declare
    //      extremely short far-arrow notation function callbacks. Simply making three line functions into a single
    //      line function ;)
    export var isDirectionLeft  = (x: number): boolean => x <= -constants.VelocityTreshold;
    export var isDirectionRight = (x: number): boolean => x >= constants.VelocityTreshold;
    export var isDirectionDown  = (y: number): boolean => y >= constants.VelocityTreshold;
};

export = constants;
