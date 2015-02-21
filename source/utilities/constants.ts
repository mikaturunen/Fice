"use strict";

// TODO in the future we can replace http-server with node and serve the maps from DB if we see the need for it
var lvlJson = require("../assets/levels/lvl.json");

// NOTE All constants are exported with capital letter

/**
 * @module constants
 * Module for constants (hard-coded) values used by the game.
 */
module constants {
    var levelsDirectory: string = "levels/";
    var imagesDirectory: string = "images/"

    export var AssetDirectory: string = "/assets/";

    /** @type {string} Generalized location for level assets. */
    export var LevelsAssetDirectory: string = constants.AssetDirectoryPath + levelsDirectory;

    /** @type {string} Generalized location for image assets. */
    export var ImagesAssetDirectory: string = constants.AssetDirectoryPath + imagesDirectory;

    /** @type {TileSize} Size of tiles in the game world. */
    export var TileSize: TileSize = { width: 32, heigth: 32 };

    /** @type {number} The constants velocity everything moves in the game. */
    export var Velocity: number = 55;

    /** @tpye {number} Velocity treshold - when something moves slower than this, it stops */
    export var VelocityTreshold: number = 0.1;
};

export = constants;
