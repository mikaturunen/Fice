"use strict";

// Only ONE thing at a time can move - player, tile or something else.var somethingMoving: boolean = false;


module tiles {
    export var layers: { [ layerName: string ]: Phaser.TilemapLayer; } = { };
    var loadLayers = (map: any) => {
        [
            "collision",
            "background"
        ]
        .forEach((layer: string) => {
            layers[layer] = map.createLayer(layer);
            layers[layer].resizeWorld();
        });

        map.setCollisionBetween(1, 2000, true, "collision");
    };
}

export = tiles;
