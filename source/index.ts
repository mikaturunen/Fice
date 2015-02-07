"use strict";

var tileLoader = require("./loader/tiles");

/** 
 * Phaser initialization script
 */
var init = () => {
    var preload = () => {
        game.load.image("logo", "../assets/phaser.png");
    };

    var create = () => {
        var logo = game.add.sprite(game.world.centerX, game.world.centerY, "logo");
        logo.anchor.setTo(0.5, 0.5);
    };
    
    var game = new Phaser.Game(800, 600, Phaser.AUTO, "", { 
        preload: preload, 
        create: create 
    });
};

init();
