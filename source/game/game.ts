"use strict";

// Loading all the entity modules.
import player = require("../player/player");
import ice = require("../ice/ice");
import fires = require("../fires/fire");
import world = require("../world/tiles");
import constant = require("../utilities/constants");
import collision = require("../physics/resolver");
import utilities = require("../utilities/utilities");
import physics = require("../physics/physics");

// NOTE (ONCE): pre -> create -> (REPEAT): update -> render

// Wacky resolution? Yes, I'm going currently for the remake of the original so..
var game: Phaser.Game;

/**
 * Preloads the game content. Used to assets into Phaser.
 * @param {Game.Phaser} game Phasers game object
 * @returns {Function} Function that is given to Phaser.
 */
function preloadGame() {
    return () => {
        game.load.tilemap("level", utilities.level("lvl-debug.json"), null, Phaser.Tilemap.TILED_JSON);
        game.load.image("tiles", utilities.image("debug-colors.png"));
        game.load.spritesheet("player", utilities.image("player-sheet.png"), constant.TileSize.width, constant.TileSize.heigth);
        // Note items sprite sheet is funky and it's not 128 pixels wide like the rest but 120 pixels..
        // TODO look into fixing the items-sheet.png when I'm feeling the jam.
        game.load.spritesheet("items", utilities.image("debug-colors.png"), 32, constant.TileSize.heigth);
    };
}

/**
 * Creates game content after loading assets.
 * @param {Game.Phaser} game Phasers game object
 * @returns {Function} Function that is given to Phaser.gulp
 */
function createGame() {
    return () => {
        game.stage.backgroundColor = "#787878";
        //have the game centered horizontally
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;

        // Creating the actual map from the tiled data
        world.map = game.add.tilemap("level");
        world.map.addTilesetImage("tiles", "tiles");
        world.loadLayers([ "background", "collision" ]);

        player.init(game);
        ice.init(game);
        fires.init(game);
    };
}

/**
 * Games update loop for Phaser.
 * @param {Game.Phaser} game Phasers game object
 * @returns {Function} Function that is given to Phaser.
 */
function updateGame() {
    return () => {
        player.update(game);
        ice.update(game);
        fires.update(game);

        physics.update(game);
    };
}


var renderBodyInfo = () => {
    var body = physics.getBody(game.input.mousePointer.x, game.input.mousePointer.y);
    if (body) {
        var x = Math.round(body.x / 32);
        var y = Math.round(body.y / 32);
        var cx = body.x;
        var cy = body.y;
        var ttype = body.tiledType;
        game.debug.text("ENTITY: " +x+ ", " +y+ " -- " +body.velocity.x+ ", " +body.velocity.y+ " -- " +ttype+ ", id: "+body._uniqueId, 10, 13*32);
    }   
};

/**
 * Additional render loop for Phaser.
 * @param {Game.Phaser} game Phasers game object
 * @returns {Function} Function that is given to Phaser.
 */
function renderGame() {
    return () => {
        game.debug.text("Moving bodies  : " + JSON.stringify(physics.currentlyMovingBody !== undefined), 10, 10);
        game.debug.text("Player movement: " + player.sprite.body.velocity.x, 10, 25);
        game.debug.text("Player y       : " + Math.round(player.sprite.body.y) + ",  " + Math.round(player.sprite.body.y/32), 10, 40);
        game.debug.text("Player x       : " + Math.round(player.sprite.body.x) + ",  " + Math.round(player.sprite.body.x/32), 10, 55);
        // 2nd column
        game.debug.text("__bodyUnder: " + player.sprite.body.____isOnTopOfBody, 250, 10);
        game.debug.text("mouse x,y: " + Math.round(game.input.mousePointer.x) + ", " + Math.round(game.input.mousePointer.y), 250, 25);
        renderBodyInfo();
    };
}

/**
 * @module gameworld
 * Game module for Phaser that holds all the Phaser.Game object related content
 * inside itself
 */
module gameworld {
    export function init() {
        game = new Phaser.Game(16 * constant.TileSize.width, 14 * constant.TileSize.heigth, Phaser.AUTO, "FIce",
        {
            preload: preloadGame(),
            create: createGame(),
            update: updateGame(),
            render: renderGame()
        });
    }
}

export = gameworld;
