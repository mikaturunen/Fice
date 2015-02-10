"use strict";

// Loading the map explicitly
// TODO in the future we can replace http-server with node and serve the maps from DB if we see the need for it

// NOTE Please note that all code here is extremely experimental and on a level where I'm just seeing what Phaser can do :)

var image = (imageName: string) => {
    return "/assets/images/" + imageName;
};

var level = (levelName: string) => {
    return "/assets/levels/" + levelName;  
};

var lvlJson = require("../assets/levels/lvl.json");

var tileWidth: number = 32;
var tileHeight: number = 32;

/** 
 * Creates a given type of Object from provided Type on Layer
 * @param {string} type - Type we are looking for
 * @param {string} layer - The layer we are peeking into
 * @param {any} tiledMapJson - Actual JSON of the Tiled outpu
 */
var createFromType = (type: string, layer: string, tiledMapJson: any) => {
    var results = <TiledObject[]> [ ];
    tiledMapJson.layers.forEach((tmpLayer: any) => {
        if (tmpLayer.name === layer) {
            // correct layer found
            tmpLayer.objects.forEach((object: any) => {
                if (object.type === type) {
                    // Phaser uses top left, Tiled bottom left so we have to adjust the y position, to equal phaser coordinates and to 
                    // properly position the entities in Phaser we need to do Tiled.y - TileHeight = Phaser.y
                    object.y -= tileHeight;
                    results.push(object);
                }
            });
        }
    });

    return results;
};

/** 
 * Creates a Sprite object from the given element.
 * @param {any} element - element 
 * @param {any} group - Group to associate the newly created Sprite with
 */ 
var createSprite = (element: any, group: any) => {
    var sprite = group.create(element.x, element.y, element.properties.sprite);
    
    //copy all properties to the sprite
    Object.keys(element.properties).forEach((key: string) => {
        sprite[key] = element.properties[key];
    });
};

var getXFromWorldCoordinates = (x: number) => {
    return Math.floor(x / tileWidth) * tileWidth;
};

var getYFromWorldCoordinates = (y: number) => {
    console.log(y, Math.floor(y / tileHeight) * tileHeight);
    return Math.floor(y / tileHeight) * tileHeight;
};


/** 
 * Phaser initialization script
 */
var init = () => {
    var map: Phaser.Tilemap; 
    var layer: Phaser.TilemapLayer;
    var backgroundLayer: Phaser.TilemapLayer;
    var player: Phaser.Sprite;
    
    /** 
     * Start Phaser itself
     */
    var game = new Phaser.Game(16 * tileWidth, 14 * tileHeight, Phaser.AUTO, "FIce", { 
        // Wacky resolution? Yes, I'm going currently for the remake of the original so..
        
        preload: () => {
            // Loading all the game related assets
            game.load.tilemap("level", level("lvl.json"), null, Phaser.Tilemap.TILED_JSON);
            game.load.image("tiles", image("tiles.png"));
            game.load.spritesheet("player", image("player-sheet.png"), 32, 32);
        }, 
        
        create: () => {
            game.stage.backgroundColor = "#787878";
            
            // Creating the actual map from the tiled data
            map = game.add.tilemap("level");
            map.addTilesetImage("tiles", "tiles");
            
            // TODO once the initial prototyping phase is over; read the information from Phaser.Tilemap
            var start: TiledObject[] = createFromType("START", "entities", lvlJson);
            var block: TiledObject[] = createFromType("BLOCK", "entities", lvlJson);
            var target: TiledObject[] = createFromType("TARGET", "entities", lvlJson);
            
            // Creates the layer from the collisions layer in the Tiled data
            layer = map.createLayer("collision");
            // Creating the background layer from the layer "background" in the Tiled data
            backgroundLayer = map.createLayer("background");
            map.setCollisionBetween(1, 100000, true, "collision");
        
            player = game.add.sprite(
                    getXFromWorldCoordinates(start[0].x), 
                    getYFromWorldCoordinates(start[0].y),
                    "player"
                );
            player.frame = 5;
            console.log(player);
            
            // Makes sure the game world matches the layer dimensions
            layer.resizeWorld();
        },
        
        update: () => {
            var speed: number = 0.5;
            
            if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
                player.x -= speed;
                console.log(player.x, player.y);
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                player.x += speed;
                console.log(player.x, player.y);
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
                player.y -= speed;
                console.log(player.x, player.y);
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
                player.y += speed;
                console.log(player.x, player.y);
            }
        }
    });
};

init();
