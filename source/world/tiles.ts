"use strict";

import constant = require("../utilities/constants");

/**
 * @module tiles
 * World map, tiles module. Handles all tile and map data related functionality.
 */
module tiles {
    export var map: Phaser.Tilemap;

    export var layers: { [ layerName: string ]: Phaser.TilemapLayer; } = { };

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
}

export = tiles;
