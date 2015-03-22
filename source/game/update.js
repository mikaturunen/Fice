"use strict";

var phaserStorage = require("../utilities/phaser-storage");
var player = require("../entities/player");

var update = () => {
    player.update();
};

console.log("Update in place.");
module.exports = update;