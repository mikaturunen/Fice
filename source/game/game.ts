"use strict";

// Loading all the entity modules.
import player = require("../player/player");
import blocks = require("../blocks/blocks");
import fires = require("../fires/fire");
import world = require("../world/tiles");
import constant = require("../utilities/constants");
import collision = require("../collision/solver");
import utilities = require("../utilities/utilities");

// NOTE (ONCE): pre -> create -> (REPEAT): update -> render

/**
 * Preloads the game content. Used to assets into Phaser.
 * @param {Game.Phaser} game Phasers game object
 * @returns {Function} Function that is given to Phaser.
 */
function preloadGame(game: Phaser.Game) {
    return () => {
        game.load.tilemap("level", utilities.level("lvl.json"), null, Phaser.Tilemap.TILED_JSON);
        game.load.image("tiles", utilities.image("tiles.png"));
        game.load.spritesheet("player", utilities.image("player-sheet.png"), constant.TileSize.width, constant.TileSize.heigth);
        game.load.spritesheet("items", utilities.image("items-sheet.png"), constant.TileSize.width, constant.TileSize.heigth);
    };
}

/**
 * Creates game content after loading assets.
 * @param {Game.Phaser} game Phasers game object
 * @returns {Function} Function that is given to Phaser.gulp

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
        player.checkInputs(game);

        player.checkStopConditions(game);

        collision.resolve(game);
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
    export var game: Phaser.Game = new Phaser.Game(16 * constant.TileSize.width, 14 * constant.TileSize.heigth, Phaser.AUTO, "FIce",
    {
        preload: preloadGame(game),
        create: createGame(game),
        update: updateGame(game),
        render: renderGame(game)
    });
}


export = game;
