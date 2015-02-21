"use strict";

// TODO in the future we can replace http-server with node and serve the maps from DB if we see the need for it
// NOTE Please note that all code here is extremely experimental and on a level where I'm just seeing what Phaser can do :)

var lvlJson = require("../assets/levels/lvl.json");

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
};

export = constants;
