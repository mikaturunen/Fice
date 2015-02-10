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
    var collisionLayer: Phaser.TilemapLayer;
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
            game.load.spritesheet("items", image("items-sheet.png"), 32, 32);
        }, 
        
        create: () => {
            game.stage.backgroundColor = "#787878";
            //have the game centered horizontally
            game.scale.pageAlignHorizontally = true;
            game.scale.pageAlignVertically = true;
            game.physics.startSystem(Phaser.Physics.ARCADE);
            
            // Creating the actual map from the tiled data
            map = game.add.tilemap("level");
            map.addTilesetImage("tiles", "tiles");
            
            // TODO once the initial prototyping phase is over; read the information from Phaser.Tilemap
            var start: TiledObject[] = createFromType("START", "entities", lvlJson);
            var blocks: TiledObject[] = createFromType("BLOCK", "entities", lvlJson);
            var targets: TiledObject[] = createFromType("TARGET", "entities", lvlJson);
            
            // Creates the layer from the collisions layer in the Tiled data
            collisionLayer = map.createLayer("collision");
            // Creating the background layer from the layer "background" in the Tiled data
            backgroundLayer = map.createLayer("background");
            map.setCollisionBetween(1, 2000, true, "collision");
        
            player = game.add.sprite(
                    getXFromWorldCoordinates(start[0].x), 
                    getYFromWorldCoordinates(start[0].y),
                    "player"
                );
            player.frame = 5;
            game.physics.arcade.enable(player, Phaser.Physics.ARCADE);
            player.body.setSize(32, 32);
            
            // TODO store created sprites.. but for sake of quick prototyping this is just fine :)
            blocks.forEach(block => {
                var spriteBlock: Phaser.Sprite = game.add.sprite(
                    getXFromWorldCoordinates(block.x),
                    getYFromWorldCoordinates(block.y),
                    "items"
                );
                spriteBlock.frame = 0;
                console.log(spriteBlock);
            });
            targets.forEach(target => {
                var targetBlock: Phaser.Sprite = game.add.sprite(
                    getXFromWorldCoordinates(target.x),
                    getYFromWorldCoordinates(target.y),
                    "items"
                );
                targetBlock.frame = 3;
            });

            
            // Makes sure the game world matches the layer dimensions
            collisionLayer.resizeWorld();
            backgroundLayer.resizeWorld();
        },
        
        update: () => {
            var speed: number = 2.5;
            
            // NOTE : once we get everything in place, we will not be doing .x += something but instead 
            //       we'll move the character between two positions based on time and allow movement only after
            //      the character has reached the next position (next tile), to mimic the original obviously :) 
            if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
                player.x -= speed;
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                player.x += speed;
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
                player.y -= speed;
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
                player.y += speed;
            }
            
            game.physics.arcade.collide(player, collisionLayer, (a: any, b: any) => { console.log("COLLISION", a, b); });
        }
    });
};

init();
