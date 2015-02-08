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
    var map: Phaser.Tilemap; 
    var layer: Phaser.TilemapLayer;
    var backgroundLayer: Phaser.TilemapLayer;
    
    /** 
     * Start Phaser itself
     */
    var game = new Phaser.Game(16 * 32, 14 * 32, Phaser.AUTO, "FIce", { 
        // Wacky resolution? Yes, I'm going currently for the remake of the original so..
        
        preload: () => {
            // Loading all the game related assets
            game.load.tilemap("level", level("lvl.json"), null, Phaser.Tilemap.TILED_JSON);
            game.load.image("tiles", image("tiles.png"));
        }, 
        
        create: () => {
            game.stage.backgroundColor = "#787878";
            
            // Creating the actual map from the tiled data
            map = game.add.tilemap("level");
            map.addTilesetImage("tiles", "tiles");
            // Creates the layer from the collisions layer in the Tiled data
            layer = map.createLayer("collision");
            // Creating the background layer from the layer "background" in the Tiled data
            backgroundLayer = map.createLayer("background");
            // Makes sure the game world matches the layer dimensions
            layer.resizeWorld();
        }
    });
};

init();
