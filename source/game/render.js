"use strict";

var phaserStorage = require("../utilities/phaser-storage");
var player = require("../entities/player");

var render = () => {
    var game = phaserStorage.game;
    game.debug.body(player.sprite);
};
 
console.log("Render in place.");
module.exports = render;