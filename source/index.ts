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

interface TileSize {
    width: number;
    heigth: number;
}


var tileSizes: TileSize = {
    width: 32,
    heigth: 32
};

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
                    object.y -= tileSizes.heigth;
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

var getTileFlooredXWorldCoordinate = (x: number) => {
    return Math.floor(x / tileSizes.width) * tileSizes.width;
};

var getTileFlooredYWorldCoordinate = (y: number) => {
    return Math.floor(y / tileSizes.heigth) * tileSizes.heigth;
};

var getTileXFromWorldCoordinate = (x: number) => {
    return Math.floor(x / tileSizes.width);
};

var getTileYFromWorldCoordinate = (y: number) => {
    return Math.floor(y / tileSizes.heigth);
};

var getTileCoordinateFromWorldCoordinates = (x: number, y: number, sizes: TileSize): Phaser.Point => {
    return new Phaser.Point(Math.floor(x / sizes.width), Math.floor(y / sizes.heigth));
};

var getFlooredWorldCoordinateFromWorldCoordinates = (x: number, y: number, sizes: TileSize): Phaser.Point => {
    return new Phaser.Point(Math.floor(x / sizes.width) * sizes.width, Math.floor(y / sizes.heigth) * sizes.heigth);
};

// TODO relocate these beasts into a proper location
var layers: { [ layerName: string ]: Phaser.TilemapLayer; } = { };
var blockGroup: Phaser.Group;
var targetGroup: Phaser.Group;
var player: Phaser.Sprite;
var playerTween: any = { };
var speedInMilliseconds: number = 500;

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
        var position = getFlooredWorldCoordinateFromWorldCoordinates(obj.x, obj.y, tileSizes);
        var sprite: Phaser.Sprite = game.add.sprite(position.x, position.y, "items");
        // Enabling physics for the body
        game.physics.enable(sprite, Phaser.Physics.ARCADE);
        // Setting frame and body size for the physics
        sprite.frame = frame;
        sprite.body.setSize(32,32);
        // Adding it into the blocks group
        spriteGroup.add(sprite);
    });
};

/**
 * Phaser initialization script
 */
var init = () => {

    var map: Phaser.Tilemap;
    var canMove: boolean = true;
    var moveStartTimer = 0;
    var lastUpdateLoopTotalTimer = 0;
    var nextPosition: Phaser.Point = new Phaser.Point(0, 0);
    var treshold: number = 0.1;

    /**
     * Start Phaser itself
     */
    var game = new Phaser.Game(16 * tileSizes.width, 14 * tileSizes.heigth, Phaser.AUTO, "FIce", {
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

            loadLayers(map);

            // TODO once the initial prototyping phase is over; read the information from Phaser.Tilemap
            // --> https://github.com/photonstorm/phaser/pull/1609 -- merged, waits release
            var start: TiledObject[] = createFromType("START", "entities", lvlJson);
            var position = getFlooredWorldCoordinateFromWorldCoordinates(start[0].x, start[0].y, tileSizes);
            player = game.add.sprite(position.x, position.y, "player");
            player.frame = 5;
            game.physics.enable(player, Phaser.Physics.ARCADE);
            player.body.collideWorldBounds = true;
            player.body.setSize(32,32);

            blockGroup = game.add.group();
            fillSpriteGroup(blockGroup, "BLOCK", "entities", 0, game);
            targetGroup = game.add.group();
            fillSpriteGroup(blockGroup, "TARGET", "entities", 3, game);
        },

        update: () => {

            var getNextTileWorldCoordinates = (velocityDirectionMultiplier: number) => {
                var velocity = 55 * velocityDirectionMultiplier;
                nextPosition.x = getTileFlooredXWorldCoordinate(player.body.x + (tileSizes.width * velocityDirectionMultiplier))
                player.body.velocity.x = velocity;
                console.log("current.x/nextPosition.x", player.body.x, "/", nextPosition.x, ", nextPosition.y", nextPosition.y, ", velocity:", velocity);
            };

            var falling = () => {
                var tileX = getTileXFromWorldCoordinate(player.body.x);
                var tileY = getTileYFromWorldCoordinate(player.body.y + 32);

                if (!map.hasTile(tileX, tileY, layers["collision"])) {
                    player.body.velocity.y = 55;
                    console.log("Started falling");
                    return true;
                }

                return false;
            };

            var checkMovement = () => {
                if (falling()) {

                } else if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
                    console.log("Moving left");
                    getNextTileWorldCoordinates(-1);
                } else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                    console.log("Moving right");
                    getNextTileWorldCoordinates(+1);
                }
            };

            var startMovement = () => {
                if ( (player.body.velocity.x >= -treshold && player.body.velocity.x <= treshold) ||
                     (player.body.velocity.y <= treshold) ) {

                    console.log("velocity.x:", player.body.velocity.x, ", velocity.y:", player.body.velocity.y);
                    checkMovement();
                }
            };

            var stopMovement = () => {
                // CHECK FOR COLLISION WITH NEXT TILE -> STOP PLAYER
                var setPlayerToPosition: boolean = false;

                // START FALLING -- arrived on tile below
                if (player.body.velocity.y > treshold) {
                    console.log("(F) To position:", player.body.velocity.x, player.body.x, nextPosition.x);
                }

                // MOVING LEFT -- arrived to tile
                if (player.body.velocity.x < -treshold && player.body.x <= nextPosition.x) {
                    setPlayerToPosition = true;
                    console.log("(L) To position:", player.body.velocity.x, player.body.x, nextPosition.x);
                }

                // MOVING RIGHT -- arrived to tile
                if (player.body.velocity.x > treshold && player.body.x >= nextPosition.x) {
                    setPlayerToPosition = true;
                    console.log("(R) To position:", player.body.velocity.x, player.body.x, nextPosition.x);
                }

                if (setPlayerToPosition) {                    
                    if (!checkMovement()) {
                        player.body.x = nextPosition.x;
                        player.body.velocity.x = 0;
                    }
                }
            };

            startMovement();
            stopMovement();

            var collisionHandler = (obj1: any, obj2: any) => {
                game.stage.backgroundColor = '#992d2d';
            };

            game.physics.arcade.collide(player, layers["collision"], collisionHandler, null, this);
            game.physics.arcade.collide(player, targetGroup);
            game.physics.arcade.collide(player, blockGroup);
            game.physics.arcade.collide(playerTween, blockGroup);
            game.physics.arcade.collide(targetGroup, blockGroup);
        },

        render: () => {
        }
    });
};

init();
