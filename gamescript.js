"use strict";
// おまじない
enchant();
// 定数の定義
var UNIT_SPEED_ON_STAGE = 2;
// クラス、関数の定義
function Unit_Sprite(color_id){
	Sprite.apply(this, [24, 24])
	this.r = 0;
	this.theta = 0;
	this.timer = 0;
	this.shift = 0;
	this.trans = false;
	this.frame = color_id - 1;
	this.color_id = color_id;
	this.can_dispose = 0; // 1以上なら解放フラグ 方向に対応した引数としても用いる
	if (color_id <= 0 || color_id > 4) {
		throw new Error("color_idの指定が不正です。", "gamescript.js", 60);
	}
	this.update = function() {
		this.timer += 1;
		if (this.trans) {
			return;
		}
		if (this.timer < 42 * 2) {
			this.r -= 2;
		} else if (this.timer >= 42 * 2 && this.timer < (42 * 2) + 10) {
			this.rotate(-9);
		} else if (this.shift) {
			if (this.shift == 1) {
				var foo = (this.theta - 45);
				if (foo < 0) {
					foo += 360;
				}
				foo %= 90;
				this.theta -= foo / 2;
			}
			if (this.shift <= 9) {
				this.rotate(-10);
			} else {
				this.r += 3;
			}
			if (this.r >= 196) {
				this.trans = true;
				var move_to_x;
				var move_to_y;
				var dispose_process;
				if (this.x >= 240 && this.y <= 80) {
					// 右上
					move_to_x = 180 + 6;
					move_to_y = 10 + 14;
					dispose_process = function() {this.can_dispose = 1;}
				}
				if (this.x >= 240 && this.y >= 240) {
					// 右下
					move_to_x = 270 + 6;
					move_to_y = 178 + 14;
					dispose_process = function() {this.can_dispose = 2;}
				}
				if (this.x <= 80 && this.y <= 80) {
					// 左上
					move_to_x = 14 + 6;
					move_to_y = 90 + 14;
					dispose_process = function() {this.can_dispose = 4;}
				}
				if (this.x <= 80 && this.y >= 240) {
					// 左下
					move_to_x = 104 + 6;
					move_to_y = 258 + 14;
					dispose_process = function() {this.can_dispose = 3;}
				}
				this.tl.delay(6).moveTo(move_to_x, move_to_y, 16).and()
					.rotateTo(0, 5).and().fadeOut(24).and().scaleTo(1.8, 1.8, 16)
					.then(dispose_process);
			}
			this.shift += 1;
		} else {
    		this.theta -= UNIT_SPEED_ON_STAGE;
    		if (this.theta < 0) {
    			this.theta += 360;
    		} else if (this.theta > 360) {
    			this.theta -= 360;
    		}
    		this.rotation = 180 - this.theta;
		}
    	this.setPolarToXY();	
	};
	this.setPolarToXY = function() {
		this.x = 160 + Math.cos(this.theta * Math.PI / 180.0) * this.r;
		this.x -= this.width / 2;
    	this.y = 160 - Math.sin(this.theta * Math.PI / 180.0) * this.r;
    	this.y -= this.height / 2;
	};
	this.canShift = function() {
		// 第一引数が指定されている場合角度に補正をかけます。
		var rev = 0;
		if (arguments[0]) {
			rev = arguments[0];
		}
		if (!this.shift && (this.timer > 47 * 2)) {
			var foo = (this.theta + rev - 45);
			if (foo < 0) {
				foo += 360;
			}
			foo %= 90;
			if (foo <= UNIT_SPEED_ON_STAGE * 4) {
				return true;
			}
		}
		return false;
	}
}
Unit_Sprite.prototype = new Sprite();
Unit_Sprite.constructor = Unit_Sprite;

function Rocket_Sprite(di_i, color_i) {
	/*
		プロパティ direction_idに関する仕様
		右上から左回り(反時計周り)に1,2,3,4と振り分ける	
	*/
	Sprite.apply(this, [36, 52]);
	this.capacity = 0;
	this.direction_id = di_i;
	this.color_id = color_i;
	this.opacity = 0.75;
	this.fade = false;
	this.frame = (color_i - 1) * 10;
	if (di_i<= 0 || di_i > 4) {
		throw new Error("direction_idの指定が不正です。", "gamescript.js", 57);
	}
	if (color_i < 0 || color_i > 4) {
		throw new Error("color_idの指定が不正です。", "gamescript.js", 60);
	}
	if (color_i == 0) {
		// color_idが0なら透明化する。
		this.opacity = 0;
	}
	switch(di_i) {
		case 1:
			this.moveTo(180, 10);
			break;
		case 2:
			this.moveTo(270, 178);
			break;
		case 3:
			this.moveTo(104, 258);
			break;
		case 4:
			this.moveTo(14, 90);
			break;
	}
	this.onenterframe = function() {
		if (this.fade) {
			return;
		}

		this.frame = (this.color_id - 1) * 10 + this.capacity;
		
		if (this.color_id > 0) {
			this.opacity = 0.75;
		} else {
			this.opacity = 0;
		}
	}
}
Rocket_Sprite.prototype = new Sprite();
Rocket_Sprite.constructor = Rocket_Sprite;



// クラス定義終わり
var _input = 0;
function pressSpaceKey() {
	return game.input.a == 1;
}
function rand(max) {
	return Math.floor(Math.random() * max);
}

// ゲーム本体の処理
var game;

window.onload = function() {
    game = new Game(320, 320);
    game.keybind(32, 'a');
    game.preload('img/units.png');
    game.preload('img/stage.png');
    game.preload('img/rockets.png');
    game.preload('img/background.png');
    game.preload('img/moon.png');
    game.preload('img/earth_.png');
    game.preload('img/window.png');
    game.preload('img/rocket_mini.png');
    game.preload('img/garbage.png');
    game.preload('img/explode.png');
    game.preload('img/num_char.png');
    game.fps = 15 * 2;
    game.scale = 6;
    var bgm = Sound.load('sounds/bgm.mp3');
    var plus_se = Sound.load('sounds/button09.mp3');
    var fire_se = Sound.load('sounds/fire01.wav');
    var fire2_se = Sound.load('sounds/fire02.mp3');
    var plus2_se = Sound.load('sounds/decide4.wav');
    var garbage_se = Sound.load('sounds/beep11.wav');
    var timedown_se = Sound.load('sounds/pyoro58.wav');
    var game_titlescene_process = function() {

    	//game.popScene();
    	//game.pushScene(new Scene());
    	var title_sprite = new Sprite(320, 320);
    	title_sprite.image = game.assets['img/title.png'];
    	title_sprite.opacity = 0;
    	title_sprite.tl.fadeIn(35);
    	game.rootScene.addChild(title_sprite);
    	var clicked = false;
    	title_sprite.addEventListener('touchstart', function() {clicked = true;});
    	game.rootScene.addEventListener('enterframe', function() {
    		if (pressSpaceKey() || clicked) {
    			//game.popScene();
    			//game.replaceScene(new Scene());
    			game.onload = game_main_process;
    			title_sprite.opacity = 0;
    			game.onload();
    		}
    	});

    };
    
    var game_main_process = function() {
    	// メイン画面の処理
    	// バックグラウンド
    	var background_sprite = new Sprite(640, 640);
    	background_sprite.image = game.assets['img/background.png'];
    	background_sprite.speed_x = -1;
    	background_sprite.speed_y = -2;
    	background_sprite.onenterframe = function() {
    		this.x += this.speed_x;
    		this.y += this.speed_y;
    		if (this.x <= -320) {
    			this.speed_x *= -1;
    		}
    		if (this.x >= 0) {
    			this.speed_x *= -1;
    			this.speed_x -= 0.25;
    		}
    		if (this.y <= -320) {
    			this.speed_y *= -1;
    		}
    		if (this.y >= 0) {
    			this.speed_y *= -1;
    			this.speed_y -= 0.25;
    		}
    	};
    	game.rootScene.addChild(background_sprite);
    	// ステージ
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

    	// GameTimer(7進数)
    	var gametimer_sprites = new Array(3);
    	for (var i = 0;i<3;i++) {
    		gametimer_sprites[i] = new Sprite(16, 16);
    		gametimer_sprites[i].image = game.assets["img/num_char.png"];
    		gametimer_sprites[i].frame = rand(7);
    		gametimer_sprites[i].x = 160 - 8 - 16 + 17 * i
    		gametimer_sprites[i].y = 160 - 8;
    		
    		game.rootScene.addChild(gametimer_sprites[i]);
    	}
    	var gamelimit_timer = 98;
    	updateLimitTimer();
    	// -----------------------------------------------------------------------
    	// 初期化
    	var rockets = new Array();
		for(var i = 1;i<=4;i++) {
			rockets[i] = new Rocket_Sprite(i, 0)
			rockets[i].image = game.assets["img/rockets.png"];
			game.rootScene.addChild(rockets[i]);
		}
    	// メイン処理使用変数の初期化
    	var main_timer = 1;
    	var game_barance_tempo = 0;
    	var units = new Array();
    	var unit_count = 1;
    	var call_trashscene = 0;
    	addUnit(3, 1);
    	var each_frame_event = function() {
    		// メイン処理
    		// ユニットの更新処理と破棄
    		for(var i = 0;i<units.length;i++) {
    			if (units[i].can_dispose >= 1) {
    				addPoint(units[i].can_dispose, units[i].color_id);
    				units[i].tl.removeFromScene();
    				units.splice(i, 1);
    				i--;
    				
    				continue;
    			}
    			units[i].update();
    			if (pressSpaceKey() && units[i].canShift()) {
    					units[i].shift = 1;
    			}
    			
    		}
    		// 数フレームごとにユニットを追加する
    		/*
    		  メモ:1unitは360度で当然一回転
    		  1frameあたり2度動くので180フレームで一回転
    		  さらに現在30FPSの設定なので6秒で一周する

    		  45度動くたびに判定を行いたい
    		  23,45
    		*/
    		if (main_timer % 22.5 <= 0.5) {
    			if (canInsertUnit()) {
    				/*if (rand(6) == 0) {
    					addUnit(rand(4) + 1, rand(4) + 1);
    				}*/

    				// ユニットの投入バランスの考慮
    				/*
						----------------------------
						バランス考慮として初期は赤しか投入しない、規定時間経過後第二色を投入
						最初の打ち上げ後3色目を投入
						さらに1目標達成後4色目とする。
						----------------------------
    				*/
    				if (game_barance_tempo == 0 && rand(2) == 1) {
    					addUnit(rand(4) + 1, 1);
    					if (unit_count <= 5){
    						
    					}
    				} else {

    				}
    				var sum_cap = 0;


    			}
    		}
    		// 別画面の呼び出しがある場合、指定フレーム後に呼び出す		
    		if (call_trashscene > 0) {
    				call_trashscene--;
    				if (call_trashscene == 0) {
    					showTrashScene();
    				}
    			
    		}
    		if (main_timer % (game.fps) == 0) {
    			gamelimit_timer--;
    			updateLimitTimer();
    		}
    		// BGM 2秒目に演奏を開始する。
    		if (main_timer == game.fps * 2) {
    			bgm.play();
    		}
    		// メインタイマーの加算
    		main_timer += 1;
    	}
    	game.rootScene.addEventListener('enterframe', each_frame_event);
    	
    	function addUnit(dir, color_id) {
    		var unit_sprite = new Unit_Sprite(color_id);
    		unit_sprite.image = game.assets['img/units.png'];
    		unit_sprite.originX = unit_sprite.originY = 12;
    		unit_sprite.rotate(135 - 90 * dir);
    		unit_sprite.r = 240;
    		unit_sprite.theta = 135 + 90 * dir;
    		unit_sprite.setPolarToXY();
    		game.rootScene.addChild(unit_sprite);
    		units.push(unit_sprite);
    		unit_count++;
    	}
    	function addPoint(dir, color_id) {
    		if (rockets[dir].color_id == 0) {
    			rockets[dir].color_id = color_id;
    			rockets[dir].capacity = 1;
    			plus_se.play();
    		} else {
    			if (rockets[dir].color_id == color_id) {
    				rockets[dir].capacity += 1;
    				if (rockets[dir].capacity >= 9) { //10
    					plus2_se.play();
    					call_trashscene = 25;
    					rockets[dir].fade = true;
    					rockets[dir].frame += 1;
    					// reset
    					rockets[dir].capacity = 0;
    					rockets[dir].color_id = 0;
    					rockets[dir].tl.scaleTo(0.1, 10, 8).and().fadeOut(10);
    				} else {
    					plus_se.play();
    				}
    			} else {
    				rockets[dir].capacity -= 1;
    				if (rockets[dir].capacity <= 0) {
    					rockets[dir].capacity = 0;
    				}
    			}
    			
    		}

    	}
    	function showTrashScene(color_id) {
    		game.pushScene(new Scene());
    		var sprite1 = new Sprite(220, 220);
    		var sprite2 = new Sprite(220, 220);
    		var sprite3 = new Sprite(220, 220);
    		sprite1.x = sprite2.x = sprite3.x = 50;
    		sprite1.y = sprite2.y = sprite3.y = 50;
    		sprite1.opacity = sprite2.opacity = sprite3.opacity = 0;
    		var mini_rocket_sprite = new Sprite(16, 24);
    		mini_rocket_sprite.opacity = 0;
    		sprite1.image = game.assets['img/window.png'];
    		sprite2.image = game.assets['img/earth_.png'];
    		sprite3.image = game.assets['img/moon.png'];
    		mini_rocket_sprite.image = game.assets['img/rocket_mini.png'];
    		game.currentScene.addChild(sprite1);
    		game.currentScene.addChild(mini_rocket_sprite);
    		game.currentScene.addChild(sprite2);
    		game.currentScene.addChild(sprite3);
    		sprite1.tl.fadeIn(12);
    		sprite2.tl.fadeIn(12);
    		sprite3.tl.fadeIn(12);
    		var sub_timer = 1;
    		var explode;
    		var garbage1;
    		var garbage2;
    		var garbage3;
    		game.currentScene.addEventListener('enterframe', function() {
    			if (sub_timer == 35) {
    				mini_rocket_sprite.opacity = 1;
    				mini_rocket_sprite.x = 160 - 8;
    				mini_rocket_sprite.y = 50 + 144
    				fire_se.play();
    			}
    			if (sub_timer > 35 && sub_timer <= 35 + 45) {
    				var t = sub_timer - 35;
    				mini_rocket_sprite.y -= (-0.0074074 * t * t) + (0.3407407 * t);
    				// 46フレームで120pixel上に動かす
    				// ∫(-ax^2 + bx)dx = 120 → a = 0.0074074
    				// f'(x) = -2ax + b && f'(23) = 0 → b = 46a
    			} else if (sub_timer == 100) {
    				/*
    				  g1:(96, 18)
    				  g2:(118, 25)
    				  g3:(109, 41)
    				*/
    				mini_rocket_sprite.opacity = 0;
    				garbage1 = new Sprite(8, 8);
    				garbage2 = new Sprite(8, 8);
    				garbage3 = new Sprite(8, 8);
    				garbage1.image = game.assets['img/garbage.png'];
    				garbage2.image = game.assets['img/garbage.png'];
    				garbage3.image = game.assets['img/garbage.png'];
    				garbage1.opacity = garbage2.opacity = garbage3.opacity = 0;
    				
    				garbage1.moveTo(96 + 50, 18 + 50);
    				garbage2.moveTo(118 + 50, 25 + 50);
    				garbage3.moveTo(109 + 50, 41 + 50);
    				game.currentScene.addChild(garbage1);
    				game.currentScene.addChild(garbage2);
    				game.currentScene.addChild(garbage3);
    				garbage_se.play();
    				garbage1.tl.fadeIn(20);
    				garbage2.tl.delay(5).fadeIn(20);
    				garbage3.tl.delay(10).fadeIn(20);

    			} else if (sub_timer == 190) {
    				// 星の爆破
    				fire2_se.play();
    				garbage1.opacity = garbage2.opacity = garbage3.opacity = 0;
    				sprite3.tl.delay(10).fadeOut(15);
    				// 爆発スプライト
    				explode = new Sprite(64, 64);
    				explode.image = game.assets['img/explode.png'];
    				explode.moveTo(160 - 32, 50 + 5);
    				explode.scale(1.3, 1.3);
    				explode.opacity = 0.8
    				game.currentScene.addChild(explode);

    			} else if (sub_timer > 190 && sub_timer <= 190 + 30) {
    				explode.frame += 1;
    			} else if (sub_timer == 221) {
    				explode.tl.fadeOut(5);
    			}

    			sub_timer++;
    		});
    	}
    	function updateLimitTimer() {
    		gametimer_sprites[0].frame = gamelimit_timer / 49;
    		gametimer_sprites[1].frame = (gamelimit_timer % 49) / 7;
    		gametimer_sprites[2].frame = (gamelimit_timer % 7)
    		if (((gamelimit_timer % 49) / 7) == 0 && (gamelimit_timer % 7 == 0) && main_timer > 60)  {
    			for(var i = 0;i<3;i++) {
    				// 49の桁が下がりそうになる度振動
    				gametimer_sprites[i].tl.scaleTo(1, 1.2, 10).delay(4).scaleTo(1.0, 1.0, 10);
    			}
    			timedown_se.play();
    		}
    	}
    	function canInsertUnit() {
    		if (units.length > 8) {
    			return false;
    		}
    		var collision = false;
    		// 45-50フレーム後のユニット同士のシフト処理の競合をチェックします
    		// 48フレームで定義
    		for(var i = 0;i<units.length;i++) {
    			if (units[i].canShift(-50 * UNIT_SPEED_ON_STAGE)) {
    				collision = true;
    			}
    			if (units[i].canShift(-49 * UNIT_SPEED_ON_STAGE)) {
    				collision = true;
    			}
    			if (units[i].canShift(-48 * UNIT_SPEED_ON_STAGE)) {
    				collision = true;
    			}
    			if (units[i].canShift(-47 * UNIT_SPEED_ON_STAGE)) {
    				collision = true;
    			}
    			if (units[i].canShift(-46 * UNIT_SPEED_ON_STAGE)) {
    				collision = true;
    			}
    			if (units[i].canShift(-45 * UNIT_SPEED_ON_STAGE)) {
    				collision = true;
    			}
    		}
    		return !collision;
    	}
    };
    //game.onload = game_titlescene_process;
    game.onload = game_main_process;
    game.start();

}