"use strict";

enchant();
var Unit_Sprite = function(width, height){
	this.prototype = new Sprite(width, height);
	this.r = 0;
	this.theta = 0;
}


var game;
window.onload = function() {
    game = new Game(320, 320);
    game.preload('img/unit.png');
    game.preload('img/stage_01.png');
    game.preload('img/background.png');
    game.fps = 15;
    game.scale = 4;
    Sprite.prototype.r = 0;
    Sprite.prototype.theta = 0;
    //Sprite.prototype.
    game.onload = function() {
    	var background_sprite = new Sprite(640, 640);
    	background_sprite.image = game.assets['img/background.png'];
    	game.rootScene.addChild(background_sprite);
    	
    	var stage_sprite = new Sprite(320, 320);
    	stage_sprite.image = game.assets['img/stage_01.png'];
    	game.rootScene.addChild(stage_sprite);
    	var unit_sprite = new Sprite(32, 32);
    	unit_sprite.image = game.assets['img/unit.png'];
    	unit_sprite.rotate(45);
    	unit_sprite.r = 240;
    	unit_sprite.theta = 135;//180 + 135;
    	console.log("SIN:" + Math.sin(unit_sprite.theta * Math.PI / 180.0));
    	unit_sprite.x = 160 - 16 + Math.cos(unit_sprite.theta * Math.PI / 180.0) * unit_sprite.r;
    	unit_sprite.y = 160 - 16 - Math.sin(unit_sprite.theta * Math.PI / 180.0) * unit_sprite.r;
    	game.rootScene.addChild(unit_sprite);

    	var each_frame_event = function() {
    		background_sprite.x -= 1;
    		background_sprite.y -= 2;
    		if (unit_sprite.r > 60) {
    			unit_sprite.r -= 4;
    			if (unit_sprite.r == 60) {
    				unit_sprite.rotate(-90);
    			}
    		} else {
    			unit_sprite.theta += 4;
    		}

    		unit_sprite.x = 160 - 24 + Math.cos(unit_sprite.theta * Math.PI / 180.0) * unit_sprite.r;
    		unit_sprite.y = 160 - 24 + Math.sin(unit_sprite.theta * Math.PI / 180.0) * unit_sprite.r;
    	}
    	game.rootScene.addEventListener('enterframe', each_frame_event);
    }
    game.start();
}