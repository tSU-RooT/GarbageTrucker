"use strict";

enchant();

function Unit_Sprite(width, height){
	Sprite.apply(this, [width, height])
	this.r = 0;
	this.theta = 0;
	this.timer = 0;
	this.shift = false;
	this.update = function() {
		this.timer += 1;
		if (this.timer < 42) {
			this.r -= 4;
		} else if (this.timer >= 42 && this.timer < 48) {
			this.rotate(-18);
		} else {
    		this.theta -= 2;
    		this.rotation = 180 - this.theta;
		}
	};
	
}
Unit_Sprite.prototype = new Sprite();
Unit_Sprite.constructor = Unit_Sprite;
var _input = 0;
function pressSpaceKey() {
	return game.input.up == 1;
}

var game;
window.onload = function() {
    game = new Game(320, 320);
    game.preload('img/unit_24.png');
    game.preload('img/stage.png');
    game.preload('img/background.png');
    game.preload('img/title.png');
    game.fps = 10;
    game.scale = 4;
    game.onload = function() {
    	var background_sprite = new Sprite(640, 640);
    	background_sprite.image = game.assets['img/background.png'];
    	game.rootScene.addChild(background_sprite);
    	
    	var stage_sprite = new Sprite(320, 320);
    	stage_sprite.image = game.assets['img/stage.png'];
    	stage_sprite.timer = 0;
    	
    	stage_sprite.onenterframe = function() {
    		if (pressSpaceKey() && this.timer < 6) {
    			this.timer += 1;
    		} else if (this.timer > 0 && pressSpaceKey() == 0) {
    			this.timer -= 3;
    		}

    		this.frame = (this.timer / 3) + 1;
    		if (this.timer == 0) {
    			this.frame = 0;
    		}
    	};
    	game.rootScene.addChild(stage_sprite);
    	var unit_sprite = new Unit_Sprite(24, 24);
    	unit_sprite.image = game.assets['img/unit_24.png'];
    	unit_sprite.originX = unit_sprite.originY = 12;
    	unit_sprite.centerX = unit_sprite.centerY = 12;
    	//unit_sprite.rotate(45);
    	unit_sprite.r = 240;
    	unit_sprite.theta = 135 + 90;
    	game.rootScene.addChild(unit_sprite);
    	var each_frame_event = function() {
    		background_sprite.x -= 1;
    		background_sprite.y -= 2;
    		//unit_sprite.update();
    		//nit_sprite.x = 160 - 12 + Math.cos(unit_sprite.theta * Math.PI / 180.0) * unit_sprite.r;
    		//unit_sprite.y = 160 - 12 - Math.sin(unit_sprite.theta * Math.PI / 180.0) * unit_sprite.r;
    		unit_sprite.x = unit_sprite.y = 0;

    	}
    	game.rootScene.addEventListener('enterframe', each_frame_event);
    	
    };
    game.start();
}