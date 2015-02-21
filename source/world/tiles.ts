"use strict";

// Only ONE thing at a time can move - player, tile or something else.var somethingMoving: boolean = false;


module tiles {
    export var map: Phaser.Tilemap;

    export var layers: { [ layerName: string ]: Phaser.TilemapLayer; } = { };
}


export = tiles;
