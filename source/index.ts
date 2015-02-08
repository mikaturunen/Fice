"use strict";

// Loading the map explicitly
// TODO in the future we can replace http-server with node and serve the maps from DB if we see the need for it

var image = (imageName: string) => {
    return "/assets/images/" + imageName;
};

var level = (levelName: string) => {
    return "/assets/levels/" + levelName;  
};

/** 
 * Phaser initialization script
 */
var init = () => {
    /**
     * Preloading details
     */ 
    var preload = () => {
        // Loading all the game related assets
        game.load.image("tiles", image("tiles.png"));
        game.load.image("items", image("items.png"));
        game.load.tilemap("level1", level("lvl1.json"), null, Phaser.Tilemap.TILED_JSON);
        
        //game.load.image("player", image("player.png"));
    };

    var create = () => {
        // Creating the actual map from the tiled data
        var map: Phaser.Tilemap = game.add.tilemap("level1");
        map.addTilesetImage("tiles", "tiles");
        // Creating the specific layers on the map
        var collisionLayer: Phaser.TilemapLayer = map.createLayer("collision");
        var backgroundLayer: Phaser.TilemapLayer = map.createLayer("background");
        // Setup collisions between layers
        map.setCollisionBetween(1, 100000, true, "collisionLayer");
    };

    /** 
     * Start Phaser itself
     */
    var game = new Phaser.Game(800, 600, Phaser.AUTO, "FIce", { 
        preload: preload, 
        create: create,
        update: update
    });
};

init();
