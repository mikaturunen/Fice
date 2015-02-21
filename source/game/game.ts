"use strict";

// Loading all the entity modules.
import player = require("../player/player");
import blocks = require("../blocks/blocks");
import fires = require("../fires/fire");
import world = require("../world/tiles");

// NOTE (ONCE): pre -> create -> (REPEAT): update -> render

function checkStopConditions(game: Phaser.Game) {
    // CHECK FOR COLLISION WITH NEXT TILE -> STOP PLAYER
    var setPlayerToPosition: boolean = false;

    // START FALLING -- arrived on tile below
    if (player.sprite.body.velocity.y > treshold) {
        console.log("(F) To position:", player.sprite.body.velocity.x, player.sprite.body.x, nextPosition.x);
    }

    // MOVING LEFT -- arrived to tile
    if (player.sprite.body.velocity.x < -treshold && player.sprite.body.x <= nextPosition.x) {
        setPlayerToPosition = true;
        console.log("(L) To position:", player.sprite.body.velocity.x, player.sprite.body.x, nextPosition.x);
    }

    // MOVING RIGHT -- arrived to tile
    if (player.sprite.body.velocity.x > treshold && player.sprite.body.x >= nextPosition.x) {
        setPlayerToPosition = true;
        console.log("(R) To position:", player.sprite.body.velocity.x, player.sprite.body.x, nextPosition.x);
    }

    if (setPlayerToPosition) {
        if (!checkMovement()) {
            player.sprite.body.x = nextPosition.x;
            player.sprite.body.velocity.x = 0;
        }
    }
}

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
        world.map = game.add.tilemap("level");
        world.map.addTilesetImage("tiles", "tiles");
        world.loadLayers([ "collision", "background" ]);

        player.init(game);
        blocks.init(game);
        fires.init(game);
    };
}

/**
 * Games update loop for Phaser.
 * @param {Game.Phaser} game Phasers game object
 * @returns {Function} Function that is given to Phaser.
 */
function updateGame(game: Phaser.Game) {
    return () => {
        player.checkInputs();

        checkStopConditions();

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
