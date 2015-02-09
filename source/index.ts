"use strict";

// Loading the map explicitly
// TODO in the future we can replace http-server with node and serve the maps from DB if we see the need for it

var image = (imageName: string) => {
    return "/assets/images/" + imageName;
};

var level = (levelName: string) => {
    return "/assets/levels/" + levelName;  
};

var lvlJson = require("../assets/levels/lvl.json");

/** 
 * Creates a given type of Object from provided Type on Layer
 * @param {string} type - Type we are looking for
 * @param {string} layer - The layer we are peeking into
 * @param {any} tiledMapJson - Actual JSON of the Tiled outpu
 */
var createFromType = (type: string, layer: string, tiledMapJson: any) => {
    var results = <any[]> [ ];
    console.log(tiledMapJson, type, layer);
    
    tiledMapJson.layers.forEach((tmpLayer: any) => {
        if (tmpLayer.name === layer) {
            // correct layer found
            tmpLayer.objects.forEach((object: any) => {
                if (object.type === type) {
                    results.push(object);
                } else {
                    console.log(object.type);
                }
            });
        } else {
            console.log(layer);
        }
    });

    return results;
};

var createSprite = (element: any, group: any) => {
    var sprite = group.create(element.x, element.y, element.properties.sprite);
    
    //copy all properties to the sprite
    Object.keys(element.properties).forEach((key: string) => {
        sprite[key] = element.properties[key];
    });
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
            
            // TODO once the initial prototyping phase is over; read the information from Phaser.Tilemap
            var start = createFromType("START", "entities", lvlJson);
            var block = createFromType("BLOCK", "entities", lvlJson);
            var target = createFromType("TARGET", "entities", lvlJson);
            
            // Creates the layer from the collisions layer in the Tiled data
            layer = map.createLayer("collision");
            // Creating the background layer from the layer "background" in the Tiled data
            backgroundLayer = map.createLayer("background");
            map.setCollisionBetween(1, 100000, true, "collision");
        
            var targets = game.add.group();
            var blocks = game.add.group();
            var player = game.add.group();
            // TODO this is risky :3 I like to live dangerously. TODO  add guards :)
            createSprite(start[0], player);
            block.forEach((element: any) => { createSprite(element, blocks); });
            target.forEach((element: any) => { createSprite(element, targets); });
            
            // Makes sure the game world matches the layer dimensions
            layer.resizeWorld();
        }
    });
};

init();
