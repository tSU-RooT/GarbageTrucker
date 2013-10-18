"use strict";

enchant();

function Unit_Sprite(width, height){
	Sprite.apply(this, [width, height])
	this.r = 0;
	this.theta = 0;
	this.time = 0;
	update: function() {
		this.time += 1;
	}
}
Unit_Sprite.prototype = new Sprite();


Unit_Sprite.constructor = Unit_Sprite;

function pressSpaceKey() {
	return false;
}

var game;
window.onload = function() {
    game = new Game(320, 320);
    game.preload('img/unit_24.png');
    game.preload('img/stage_01.png');
    game.preload('img/background.png');
    game.preload('img/title.png');
    game.fps = 15;
    game.scale = 4;
    game.onload = function() {
    	var background_sprite = new Sprite(640, 640);
    	background_sprite.image = game.assets['img/background.png'];
    	game.rootScene.addChild(background_sprite);
    	
    	var stage_sprite = new Sprite(320, 320);
    	stage_sprite.image = game.assets['img/stage_01.png'];
    	game.rootScene.addChild(stage_sprite);
    	var unit_sprite = new Unit_Sprite(24, 24);
    	unit_sprite.image = game.assets['img/unit_24.png'];
    	unit_sprite.rotate(45);
    	unit_sprite.r = 240;
    	unit_sprite.theta = 135 + 90;//180 + 135;
    	game.rootScene.addChild(unit_sprite);
    	//unit_sprite.scale(0.75, 0.75);
    	var each_frame_event = function() {
    		background_sprite.x -= 1;
    		background_sprite.y -= 2;
    		if (unit_sprite.r > 72) {
    			unit_sprite.r -= 4;

    			/*if (unit_sprite.r == 60) {
    				unit_sprite.rotation = -45;
    			}*/
    		} else {
    			unit_sprite.theta -= 3;
    			unit_sprite.rotation = 180 - unit_sprite.theta;
    		}

    		unit_sprite.x = 160 - 12 + Math.cos(unit_sprite.theta * Math.PI / 180.0) * unit_sprite.r;
    		unit_sprite.y = 160 - 12 - Math.sin(unit_sprite.theta * Math.PI / 180.0) * unit_sprite.r;
    	}
    	game.rootScene.addEventListener('enterframe', each_frame_event);
    }
    game.start();
}