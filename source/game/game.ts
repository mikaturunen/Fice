"use strict";

// NOTE (ONCE): pre -> create -> (REPEAT): update -> render

/**
 * Preloads the game content. Used to assets into Phaser.
 * @param {Game.Phaser} game Phasers game object
 * @returns {Function} Function that is given to Phaser.
 */
function preloadGame(game: Phaser.Game) {
    return () => {
        game.load.tilemap("level", level("lvl.json"), null, Phaser.Tilemap.TILED_JSON);
        game.load.image("tiles", image("tiles.png"));
        game.load.spritesheet("player", image("player-sheet.png"), 32, 32);
        game.load.spritesheet("items", image("items-sheet.png"), 32, 32);
    };
}

/**
 * Creates game content after loading assets.
 * @param {Game.Phaser} game Phasers game object
 * @returns {Function} Function that is given to Phaser.
 */
function createGame(game: Phaser.Game) {
    return () => {
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
        fillSpriteGroup(targetGroup, "TARGET", "entities", 3, game);
    };
}

/**
 * Games update loop for Phaser.
 * @param {Game.Phaser} game Phasers game object
 * @returns {Function} Function that is given to Phaser.
 */
function updateGame(game: Phaser.Game) {
    return () => {

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
            console.log("obj1", obj1, ", obj2", obj2);
        };

        // PLAYER VS THE OBJECTS
        game.physics.arcade.collide(player, layers["collision"]);
        game.physics.arcade.collide(player, targetGroup, playerToTargetCollision, null, this);
        game.physics.arcade.collide(player, blockGroup, playerToBlockCollision, null, this);

        // TARGET VS BLOCKS
        game.physics.arcade.collide(targetGroup, blockGroup, collisionHandler, null, this);
    };
}

/**
 * Additional render loop for Phaser.
 * @param {Game.Phaser} game Phasers game object
 * @returns {Function} Function that is given to Phaser.
 */
function renderGame(game: Phaser.Game) {
    return () => {
    };
}

/**
 * @module game
 * Game module for Phaser that holds all the Phaser.Game object related content
 * inside itself
 */
module game {

    // Wacky resolution? Yes, I'm going currently for the remake of the original so..
    export var game = new Phaser.Game(16 * tileSizes.width, 14 * tileSizes.heigth, Phaser.AUTO, "FIce",
    {
        preload: preloadGame(game),
        create: createGame(game),
        update: updateGame(game),
        render: renderGame(game)
    });
}


export = game;
