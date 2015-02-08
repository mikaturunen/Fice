"use strict";

/** 
 * Used to load the tile based levels into the Phaser engine
 * @module TileLoader
 */
module TileLoader ={
    
    /**
     * @param {TileBasedLevel} level - Level to load into the engine as the active level.
     */
    load: (level: TileBasedLevel) => {
        level.tileLayers.forEach((layer: TileLayer) => {
            
        });    
    }
};

export = TileLoader;