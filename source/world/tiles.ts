"use strict";

// Only ONE thing at a time can move - player, tile or something else.var somethingMoving: boolean = false;

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
}

export = tiles;
