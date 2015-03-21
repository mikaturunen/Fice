"use strict";

import constant = require("../utilities/constants");
import utilities = require("../utilities/utilities");
import path = require("path");

var levels: any = {
    "1": {
        "1": { 
            path: constant.LevelsAssetDirectory + "lvl1-1.debug.json", 
            json: require("../../assets/levels/lvl1-1.debug.json")
        },
        "2": {
            path: constant.LevelsAssetDirectory + "lvl1-2.debug.json", 
            json: require("../../assets/levels/lvl1-2.debug.json")
        }
    }
}

/**
 * @module tiles
 * World map, tiles module. Handles all tile and map data related functionality.
 */
module tiles {
    export var map: Phaser.Tilemap;

    export var currentLevelJson: any;

    export var currentLevelJsonFile: string;

    export var world: number = 1;

    export var level: number = 1;

    export var layers: { [ layerName: string ]: Phaser.TilemapLayer; } = { };

    export function loadLevel(game: Phaser.Game, world: number, level: number) {
        // Direct system level file path url to the module to require (this time it's JSON and not an actual module)
        currentLevelJson = <any> levels[world][level].json;
        // HTTP url to the level json
        game.load.tilemap("level", levels[world][level].path, null, Phaser.Tilemap.TILED_JSON);
    }

    /**
     * Loads given layers to be the active Layers.
     */
    export function loadLayers(layers: string[]) {
        if (!map) {
            throw "Map not created.";
        }

        layers.forEach((layer: string) => {
            tiles.layers[layer] = map.createLayer(layer);
            tiles.layers[layer].resizeWorld();
        });

        tiles.map.setCollisionBetween(1, 2000, true, "collision");
    };

    export function getTilePixelXY(x: number, y: number) {
        return map.getTileWorldXY(
            x,
            y,
            constant.TileSize.width,
            constant.TileSize.heigth,
            "collision"
        );
    }

    /**
     * Returns all the tiles on "Collision" layer from the Tiled data.
     * @Returns {Phaser.Tile[]} List of all tiles
     */
    export function getAllTiles() {
        var width: number = constant.TotalTilesX * constant.TileSize.width;
        var heigth: number = constant.TotalTilesY * constant.TileSize.heigth;
        return tiles.layers["collision"].getTiles(0, 0, width, heigth, true);
    }

    /** 
     * Attempts to find a tile from the velocity indicated direction
     * @param {PhysicsBody} body Body to inspect for Velocity
     * @Returns {Phaser.Tile} Tile if there is a blocking tile. Undefined if no tile can be found.
     */
    export function getTileBasedOnPositionAndDirection(body: PhysicsBody) {
        if (constant.isDirectionLeft(body.velocity.x)) {
            // Get tile on left
            return tiles.map.getTileWorldXY(
                    Math.round(body.x - body.velocity.x), 
                    Math.round(body.y), 
                    constant.TileSize.width, 
                    constant.TileSize.heigth, 
                    "collision"
                );
        } else if (constant.isDirectionRight(body.velocity.x)) {
            // Get tile on right
            return tiles.map.getTileWorldXY(
                    Math.round(body.x + constant.TileSize.width + body.velocity.x), 
                    Math.round(body.y), 
                    constant.TileSize.width, 
                    constant.TileSize.heigth, 
                    "collision"
                );
        } else if (constant.isDirectionDown(body.velocity.x)) {
            // Get tile below
            return tiles.map.getTileWorldXY(
                    Math.round(body.x), 
                    Math.round(body.y + constant.TileSize.heigth + body.velocity.y), 
                    constant.TileSize.width, 
                    constant.TileSize.heigth, 
                    "collision"
                );
        }

        return undefined;
    }
}

export = tiles;
