"use strict";

var _ = require("lodash");

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

// TODO relocate these beasts into a proper location
var layers: { [ layerName: string ]: Phaser.TilemapLayer; } = { };
var blockGroup: Phaser.Group;
var targetGroup: Phaser.Group;
var player: Phaser.Sprite;
 
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

var fillSpriteGroup = (spriteGroup: Phaser.Group, type: string, layer: string, frame: number, game: any) => {
    createFromType(type, layer, lvlJson).forEach((obj: TiledObject) => {
        var sprite: Phaser.Sprite = game.add.sprite(
            getXFromWorldCoordinates(obj.x),
            getYFromWorldCoordinates(obj.y),
            "items"
        );
        // Enabling physics for the body
        game.physics.enable(sprite, Phaser.Physics.ARCADE);
        // Setting frame and body size for the physics
        sprite.frame = frame;
        sprite.body.setSize(32,32); 
        // Adding it into the blocks group
        spriteGroup.add(sprite);
    });
            
}

/** 
 * Phaser initialization script
 */
var init = () => {
    var map: Phaser.Tilemap; 

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
            // --> https://github.com/photonstorm/phaser/pull/1609 -- merged, waits release
            var start: TiledObject[] = createFromType("START", "entities", lvlJson);
            player = game.add.sprite(
                    getXFromWorldCoordinates(start[0].x), 
                    getYFromWorldCoordinates(start[0].y),
                    "player"
                );
            player.frame = 5;
            game.physics.enable(player, Phaser.Physics.ARCADE);
            player.body.collideWorldBounds = true;
            player.body.setSize(32,32); 
            
            blockGroup = game.add.group();
            fillSpriteGroup(blockGroup, "BLOCK", "entities", 0, game);
            targetGroup = game.add.group();
            fillSpriteGroup(blockGroup, "TARGET", "entities", 3, game);

            loadLayers(map);
        },
        
        update: () => {
            var speed: number = 40.5;
            
            // NOTE : once we get everything in place, we will not be doing .x += something but instead 
            //       we'll move the character between two positions based on time and allow movement only after
            //      the character has reached the next position (next tile), to mimic the original obviously :) 
            if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
                player.body.velocity.x = -speed;
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                player.body.velocity.x = speed;
            } else {
                player.body.velocity.x = 0;
            }
            
            var collisionHandler = (obj1: any, obj2: any) => {
                game.stage.backgroundColor = '#992d2d';
            }; 

            game.physics.arcade.collide(player, collision, collisionHandler, null, this);
            game.physics.arcade.collide(player, targetGroup);
            game.physics.arcade.collide(player, blockGroup);
            game.physics.arcade.collide(targetGroup, blockGroup);
        },
        
        render: () => {
        }
    });
};

init();
