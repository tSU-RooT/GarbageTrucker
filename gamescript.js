"use strict";
// おまじない
enchant();
// 定数の定義
var UNIT_SPEED_ON_STAGE = 2;
var ADD_TIMING = [11, 22, 34, 0];
var STARS = ["Moon", "Mars", "Jupiter", "Saturn","Comet","Spiderβ", "AlphaCentauri","Syrius"];
var USER_AGENT = window.navigator.userAgent.toLowerCase();

// クラス、関数の定義
function Unit_Sprite(color_id) {
    Sprite.apply(this, [24, 24]);
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

        if (this.timer < 42 * 4 / game.unit_speed) { // 1-81(80frame)
            this.r -= game.unit_speed;
        } else if (this.timer >= 42 * 4 / game.unit_speed && this.timer < ((42 * 4) + 10 * 2) / game.unit_speed) {
            this.rotate(-9 * game.unit_speed / 2);
        } else if (this.shift) {
            if (this.shift == 1) {
                var foo = (this.theta - 45);
                if (foo < 0) {
                    foo += 360;
                }
                foo %= 90;
                this.theta -= foo / 4 * game.unit_speed;
            }
            if (this.shift <= 9) {
                this.rotate(-10);
            } else {
                this.r += 3 * game.unit_speed / 2;
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
                    dispose_process = function() {this.can_dispose = 4;}
                }
                if (this.x >= 240 && this.y >= 240) {
                    // 右下
                    move_to_x = 270 + 6;
                    move_to_y = 178 + 14;
                    dispose_process = function() {this.can_dispose = 3;}
                }
                if (this.x <= 80 && this.y <= 80) {
                    // 左上
                    move_to_x = 14 + 6;
                    move_to_y = 90 + 14;
                    dispose_process = function() {this.can_dispose = 1;}
                }
                if (this.x <= 80 && this.y >= 240) {
                    // 左下
                    move_to_x = 104 + 6;
                    move_to_y = 258 + 14;
                    dispose_process = function() {this.can_dispose = 2;}
                }
                this.tl.delay(6).moveTo(move_to_x, move_to_y, 16).and()
                    .rotateTo(0, 5).and().fadeOut(24).and().scaleTo(1.8, 1.8, 16)
                    .then(dispose_process);
            }
            this.shift += 1;
        } else {
            this.theta -= game.unit_speed;
            this.rotation = 180 - this.theta;
        }
        if (this.theta < 0) {
            this.theta += 360;
        } else if (this.theta > 360) {
            this.theta -= 360;
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
        if (!this.shift && this.timer > ((42 * 4) + 10 * 2) / game.unit_speed) {
            var foo = (this.theta + rev - 45);
            if (foo < 0) {
                foo += 360;
            }
            foo %= 90;
            if (foo <= UNIT_SPEED_ON_STAGE * 3) {
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
        左上から左回り(反時計周り)に1,2,3,4と振り分ける    
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
        case 4:
            this.moveTo(180, 10);
            break;
        case 3:
            this.moveTo(270, 178);
            break;
        case 2:
            this.moveTo(104, 258);
            break;
        case 1:
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
var _touched = false
var soundon = true;
// もっとも外側に置く関数
function pressSpaceKey() {
    return (game.input.a == 1) || _touched;
}
function rand(max) {
    return Math.floor(Math.random() * max);
}
function sound_play(audio, overlap) {
    if (soundon && audio) {
        if (overlap) {
            audio.clone().play();
        } else {
            audio.play();
        }
        
    }
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
    game.preload('img/background2.png');
    game.preload('img/earth_.png');
    game.preload('img/window.png');
    game.preload('img/rocket_mini.png');
    game.preload('img/garbage.png');
    game.preload('img/explode.png');
    game.preload('img/numc.png');
    game.preload('img/black.png');
    game.preload('img/silent.png');
    for (var i = 0;i<STARS.length;i++) {
        game.preload("img/" + STARS[i] + ".png");
    }
    game.fps = 30;
    //game.scale = 6;
    game.star = "moon"
    game.star_id = 0;//0;
    game.score = 0;
    game.star_garbage = 0;//0;
    game.unit_speed = UNIT_SPEED_ON_STAGE;
    game.difficult = false;
    game.preload(['sounds/bgm.mp3', 'sounds/button09.mp3', 'sounds/fire01.wav', 'sounds/fire02.mp3', 'sounds/decide4.wav', 'sounds/beep11.wav',
                  'sounds/cursor31.wav', 'sounds/crash10.wav', 'sounds/beep05.wav', 'sounds/pyoro58.wav', 'sounds/cancel5.wav']);
    var bgm;
    var plus_se;
    var fire_se;
    var fire2_se;
    var plus2_se;
    var garbage_se;
    var cursor_se;
    var show_se;
    var beep_se;
    var timedown_se;
    var down_se;
    function soundset() {
        bgm = game.assets["sounds/bgm.mp3"];
        plus_se = game.assets["sounds/button09.mp3"];
        fire_se = game.assets['sounds/fire01.wav'];
        fire2_se = game.assets['sounds/fire02.mp3'];
        plus2_se = game.assets['sounds/decide4.wav'];
        garbage_se = game.assets['sounds/beep11.wav'];
        cursor_se = game.assets['sounds/cursor31.wav'];
        show_se = game.assets['sounds/crash10.wav'];
        beep_se = game.assets['sounds/beep05.wav'];
        down_se = game.assets['sounds/cancel5.wav'];
        timedown_se = game.assets['sounds/pyoro58.wav'];
    }

    var game_main_process = function() {
        // メイン画面の処理
        soundset();
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
                this.speed_x -= 0.1;
            }
            if (this.y <= -320) {
                this.speed_y *= -1;
            }
            if (this.y >= 0) {
                this.speed_y *= -1;
                this.speed_y -= 0.1;
            }
            if (change_background_flag) {
                change_background_flag = false;
                this.speed_x = -1;
                this.speed_y = -2;
                this.image = game.assets['img/background2.png'];
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

        // GameTimer(10進数)
        var gametimer_sprites = new Array(3);
        for (var i = 0;i<3;i++) {
            gametimer_sprites[i] = new Sprite(16, 16);
            gametimer_sprites[i].image = game.assets["img/numc.png"];
            gametimer_sprites[i].frame = 0;
            gametimer_sprites[i].x = 160 - 8 - 16 + 17 * i
            gametimer_sprites[i].y = 160 - 8;
            gametimer_sprites[i].opacity = 0;
            gametimer_sprites[i].tl.fadeIn(90);
            game.rootScene.addChild(gametimer_sprites[i]);
        }
        var gamelimit_timer = 65;//98;
        updateLimitTimer();
        // -----------------------------------------------------------------------
        // 初期化
        var rockets = new Array();
        for(var i = 1;i<=4;i++) {
            rockets[i] = new Rocket_Sprite(i, 0)
            rockets[i].image = game.assets["img/rockets.png"];
            game.rootScene.addChild(rockets[i]);
        }
        var touch_sprite = new Sprite(320 ,320);
        touch_sprite.addEventListener('touchstart', function() {_touched = true;});
        touch_sprite.addEventListener('touchend', function() {_touched = false;});
        game.rootScene.addChild(touch_sprite);
        var silentmark_sprite = null;
        if (USER_AGENT.indexOf("android") > -1 || USER_AGENT.indexOf("iphone") > -1) {
            silentmark_sprite = new Sprite(32, 32);
            silentmark_sprite.image = game.assets["img/silent.png"];
            silentmark_sprite.moveTo(125, 16);
            silentmark_sprite.opacity = 0.8;
            silentmark_sprite.addEventListener('touchstart', function() {
                soundon = false;
                if (bgm) {
                    bgm.stop();
                }
            });
            game.rootScene.addChild(silentmark_sprite);
        }
        // メイン処理使用変数の初期化
        var main_timer = 1;
        var game_balance_tempo = 0;
        var units = new Array();
        var unit_count = 0;
        var call_garbagescene = 0;
        var call_gamescore_scene = 0;
        var garbage_quantity = 0;
        var garbage_rocket_color_ids = [];
        var alert_show_flag = false;
        var change_background_flag = false;
        var change_unit_speed_flag = false;
        addUnit(1, 1);
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
                };
                
            }

            // ----------------------------------------------------------------------------------------
            // 数フレームごとにユニットを追加する
            /*
              メモ:1unitは360度で当然一回転
              1frameあたり2度動くので180フレームで
              さらに現在30FPSの設定なので6秒で一周する

              22.5度動くたびに判定を行いたい
              speed = 2
              (度)    22, 44, 68, 90
              (Flame) 11, 22, 34, 45 
              speed = 3
              (度)    22, 45, 66, 90
              (Flame) 7, 15, 22, 30 
              1.5秒当たり4回の投入判定
              4分の1で投入するなら、1.5秒でひとつ入る
            */
            var add_ok = false;
            if (game.unit_speed == 3) {
                add_ok = [7, 15, 22, 0].indexOf(main_timer % 30) > -1
            } else {
                add_ok = ADD_TIMING.indexOf(main_timer % 45) > -1
            }
            if (add_ok && call_gamescore_scene == 0) {
                // ユニットの投入バランスの考慮
                /*
                    ----------------------------
                    バランス考慮として初期は赤しか投入しない、
                    最初の打ち上げ後2色目を投入
                    さらに1目標達成後3色目とする。

                    ----------------------------
                    */
                // まず投入可能方向を取得する。
                var can_dir = getCanInsertDirection();
                if (can_dir.length > 0) {
                    
                    /*if (rand(4) == 0 && can_dir.length > 0) {
                        addUnit(can_dir[rand(can_dir.length)], 1)
                    }*/
                    
                    if (game_balance_tempo == 0) {
                        if (unit_count <= 12){
                            if (rand(6) == 0 && main_timer >= game.fps * 3.5) {
                                addUnit(can_dir[rand(can_dir.length)], 1)
                            }
                        } else if (rand(10) <= 2){
                            addUnit(can_dir[rand(can_dir.length)], 1)
                        }
                    } else if (game_balance_tempo >= 1 && game_balance_tempo <= 4) {
                        if (units.length < 5) {
                            if (rand(4) == 0) {
                                var RATIO = [1, 1, 2];
                                addUnit(can_dir[rand(can_dir.length)], RATIO[rand(RATIO.length)]);
                            }
                        } else {
                            if (rand(5) == 0) {
                                var RATIO = [1, 2, 2];
                                addUnit(can_dir[rand(can_dir.length)], RATIO[rand(RATIO.length)]);
                            }
                        }
                    } else if (game_balance_tempo >= 5 && game_balance_tempo <= 7) {
                        if (rand(4) == 0) {
                            var RATIO = [1, 1, 2, 2, 2];
                            addUnit(can_dir[rand(can_dir.length)], RATIO[rand(RATIO.length)]);
                        }
                    } else if (game_balance_tempo >= 8 && game_balance_tempo <= 12) {
                        if (rand(3) == 0) {
                            var RATIO = [1, 1, 1, 2, 2, 3, 3];
                            addUnit(can_dir[rand(can_dir.length)], RATIO[rand(RATIO.length)]);
                        }
                    } else if (game_balance_tempo >= 13 && game_balance_tempo <= 18) {
                        if (rand(3) == 0) {
                            var RATIO = [1, 2, 3];
                            addUnit(can_dir[rand(can_dir.length)], RATIO[rand(RATIO.length)]);
                        }
                    } else if (game_balance_tempo >= 19 && game_balance_tempo <= 28) {
                        if (game_balance_tempo % 2 == 0) {
                            if (rand(5) <= 1) {
                                var RATIO = [1, 2, 3, 3, 4];
                                addUnit(can_dir[rand(can_dir.length)], RATIO[rand(RATIO.length)]);
                            }
                        } else {
                            if (rand(4) == 0) {
                                var RATIO = [1, 1, 2, 2, 3, 4];
                                addUnit(can_dir[rand(can_dir.length)], RATIO[rand(RATIO.length)]);
                            }
                        }
                        
                    } else if (game_balance_tempo >= 29 && game_balance_tempo <= 32) {
                        if (rand(5) <= 1) {
                            var RATIO = [1, 1, 1, 2, 2, 3, 3];
                            addUnit(can_dir[rand(can_dir.length)], RATIO[rand(RATIO.length)]);
                        }
                    } else if (game_balance_tempo >= 33 && game_balance_tempo <= 40) {
                        var go = false;
                        if (units.length <= 2 && rand(10) <= 3) {
                            go = true;
                        } else if (rand(4) == 0) {
                            go = true;
                        }
                        if (go) {
                            var RATIO = [1, 2, 3, 4];
                            addUnit(can_dir[rand(can_dir.length)], RATIO[rand(RATIO.length)]);
                        }
                    }
                    // 38まで

                }
            }
            // スピード変更処理
            if ([7, 15, 22, 0].indexOf(main_timer % 30) > -1 && change_unit_speed_flag) {
                // 適切な時にのみ変更を促す
                var ok = true;
                var u;
                for (var i = 0;i<units.length;i++) {
                    u = units[i];
                    if (u.timer < ((42 * 4) + 10 * 2) / game.unit_speed || u.shift >= 1) {
                        ok = false;
                    }
                }
                if (ok) {
                    change_unit_speed_flag = false;
                    game.unit_speed = 3;
                }
            }
            // 別画面の呼び出しがある場合、指定フレーム後に呼び出す
            if (call_gamescore_scene > 0) {
                    call_gamescore_scene--;
                    if (bgm) {
                        bgm.volume -= 0.015;
                    }
                    if (call_gamescore_scene == 0) {
                        showScoreScene();
                    }
                
            }   
            if (call_garbagescene > 0) {
                    call_garbagescene--;
                    if (call_garbagescene == 0 && call_gamescore_scene == 0) {
                        showGarbageScene(garbage_rocket_color_ids);
                    }
                
            }

            //  中央タイマー処理
            if (main_timer % (game.fps) == 0) {
                
                gamelimit_timer--;
                
                updateLimitTimer();
            }
            if (bgm) {
                // BGM 2秒目に演奏を開始する。
                if (main_timer == game.fps * 2) {
                    sound_play(bgm);
                }
                // 演奏終了していたら再演奏する
                if (bgm.currentTime >= bgm.duration && main_timer > game.fps * 3) {
                    bgm.stop();
                    sound_play(bgm);

                }
            }
            // ゲーム開始20秒目に モバイル用消音ボタンを消去する    
            if (main_timer == game.fps * 20 && silentmark_sprite != null) {
                silentmark_sprite.tl.fadeOut(15).removeFromScene();
                
            }
            // メインタイマーの加算
            main_timer += 1;
        }
        game.rootScene.addEventListener('enterframe', each_frame_event);
        
        function addUnit(dir, color_id) {
            var unit_sprite = new Unit_Sprite(color_id);
            unit_sprite.image = game.assets['img/units.png'];
            unit_sprite.originX = unit_sprite.originY = 12;
            unit_sprite.rotate(135 - 90 * (dir - 1));
            unit_sprite.r = 240;
            unit_sprite.theta = 135 + 90 * (dir - 1);
            unit_sprite.setPolarToXY();
            game.rootScene.addChild(unit_sprite); 
            units.push(unit_sprite);
            unit_count++;
        }
        function addPoint(dir, color_id) {
            var r = rockets[dir];
            if (r.color_id == 0) {
                r.color_id = color_id;
                r.capacity = 1;
                game.score += 2;
                sound_play(plus_se, true)
            } else {
                if (r.color_id == color_id) {
                    r.capacity += 2;
                    game.score += 1;
                    if (r.capacity >= 8) {
                        sound_play(plus2_se, true)
                        if (call_garbagescene > 0) {
                            call_garbagescene = 25;
                            garbage_quantity += 1;
                            garbage_rocket_color_ids.push(r.color_id);

                        } else {
                            call_garbagescene = 25;
                            garbage_quantity = 1;
                            garbage_rocket_color_ids = [r.color_id];
                        }

                        r.fade = true;
                        r.frame += 1;
                        // reset
                        r.capacity = 0;
                        r.color_id = 0;
                        r.tl.scaleTo(0.1, 10, 8).and().fadeOut(8).then(function() {r.fade = false;}).scaleTo(1,1,1);
                    } else {
                        sound_play(plus_se, true);
                    }
                } else {
                    // 適当な操作で発射しないよう、調整
                    if (r.capacity >= 7 || game.difficult) {
                        r.capacity -= 2;
                    } else {
                        r.capacity -= 1;
                    }
                    if (r.capacity <= 0) {
                        r.capacity = 0;
                        r.color_id = 0;
                        r.tl.fadeOut(5);
                        if (game.difficult) {
                            sound_play(down_se);
                            gamelimit_timer -= 5;
                        }
                    }
                }
                
            }

        }
        function showGarbageScene(color_ids) {
            game.pushScene(new Scene());
            var sprite1 = new Sprite(220, 220);
            var sprite2 = new Sprite(220, 220);
            var im = game.assets['img/' + STARS[game.star_id] + ".png"];
            var sprite3 = new Sprite(im.width, im.height);
            sprite1.x = sprite2.x = 50;
            sprite1.y = sprite2.y = 50;
            sprite3.x = 160 - im.width / 2;
            sprite3.y = 58;
            sprite1.opacity = sprite2.opacity = sprite3.opacity = 0;
            var mini_rocket_sprite = new Sprite(16, 24);
            mini_rocket_sprite.opacity = 0;
            mini_rocket_sprite.frame = color_ids[0] - 1;
            sprite1.image = game.assets['img/window.png'];
            sprite2.image = game.assets['img/earth_.png'];
            sprite3.image = im;
            mini_rocket_sprite.image = game.assets['img/rocket_mini.png'];
            game.currentScene.addChild(sprite1);
            game.currentScene.addChild(mini_rocket_sprite);
            game.currentScene.addChild(sprite2);
            game.currentScene.addChild(sprite3);
            sprite1.tl.fadeIn(12);
            sprite2.tl.fadeIn(12);
            sprite3.tl.fadeIn(12);
            // 変数宣言
            var sub_timer = 1;
            var explode;
            var garbages;
            var label1;
            var label2;
            var g_max = false;
            // ゲームバランス更新処理
            game_balance_tempo += 1;
            // フレーム処理
            game.currentScene.addEventListener('enterframe', function() {
                if (sub_timer == 20) {
                    mini_rocket_sprite.opacity = 1;
                    mini_rocket_sprite.x = 160 - 8;
                    mini_rocket_sprite.y = 50 + 144
                    sound_play(fire_se);
                }
                if (sub_timer > 20 && sub_timer <= 20 + 45) {
                    var t = sub_timer - 20;
                    mini_rocket_sprite.y -= (-0.0074074 * t * t) + (0.3407407 * t);
                    // 46フレームで120pixel上に動かす
                    // ∫(-ax^2 + bx)dx = 120 → a = 0.0074074
                    // f'(x) = -2ax + b && f'(23) = 0 → b = 46a
                } else if (sub_timer == 66) {
                    mini_rocket_sprite.opacity = 0;
                    if (color_ids.length > 1) {
                        color_ids.shift();
                        sub_timer = 15;
                        mini_rocket_sprite.opacity = 0;
                        mini_rocket_sprite.frame = color_ids[0] - 1;
                    }
                } else if (sub_timer == 70) {
                    label1 = new Label();

                    if (alert_show_flag) {
                        sub_timer = 199;
                    } else {
                        alert_show_flag = true;
                        label1.color = "#ffffff";
                        label1.font = "13px sans-serif";
                        label1.text = ">garbage.emit(" + STARS[game.star_id] +")";
                        label1.x = 60;
                        label1.y = 135;
                        var sound = function() {sound_play(cursor_se);};
                        label1.tl.delay(2).then(sound).delay(18).fadeOut(1).delay(8).fadeIn(1).loop();
                        game.currentScene.addChild(label1);
                    }
                    
                } else if (sub_timer == 158) {
                    label1.tl.unloop();
                    label1.tl.removeFromScene();
                } else if (sub_timer == 200) {
                    /*
                      g1:(96, 18)
                      g2:(118, 25)
                      g3:(109, 41)
                    */
                    mini_rocket_sprite.opacity = 0;
                    game.star_garbage += garbage_quantity; // ゴミを足す
                    if (game.star_id == 0 && game.star_garbage >= 3) {
                        g_max = true;
                    } else if (game.star_garbage >= 5){
                        g_max = true;
                    }

                    garbage_quantity = 0;
                    garbages = [];
                    for (var i=0;i<10;i++) {
                        garbages[i] = new Sprite(8, 8);
                        garbages[i].image = game.assets['img/garbage.png'];
                        garbages[i].opacity = 0;
                        game.currentScene.addChild(garbages[i]);
                    }
                    
                    garbages[0].moveTo(160 - 7, 14 + 50);
                    garbages[1].moveTo(160 + 7, 20 + 50);
                    garbages[2].moveTo(160 - 16, 26 + 50);
                    garbages[3].moveTo(160 + 9, 32 + 50);
                    garbages[4].moveTo(160 - 22, 38 + 50);
                    garbages[5].moveTo(160 - 2, 44 + 50);
                    garbages[6].moveTo(160 + 14, 50 + 50);
                    garbages[7].moveTo(160 - 12, 56 + 50);
                    garbages[8].moveTo(160 + 8, 59 + 50);
                    garbages[9].moveTo(160 , 57 + 50);
                    sound_play(garbage_se);
                    
                    if (game.star_id > 0) {
                        switch(game.star_garbage) {
                            case 7:

                            case 6:

                            case 5:
                                garbages[8].tl.fadeIn(20);
                                garbages[9].tl.fadeIn(20);
                            case 4:
                                garbages[6].tl.fadeIn(20);
                                garbages[7].tl.fadeIn(20);
                            case 3:
                                garbages[4].tl.fadeIn(20);
                                garbages[5].tl.fadeIn(20);
                            case 2:
                                garbages[2].tl.fadeIn(20);
                                garbages[3].tl.fadeIn(20);
                            case 1:
                                garbages[0].tl.fadeIn(20);
                                garbages[1].tl.fadeIn(20);

                        }
                    } else {
                        switch(game.star_garbage) {
                            case 5:

                            case 4:
                            
                            case 3:
                                garbages[6].tl.fadeIn(20);
                                garbages[8].tl.fadeIn(20);
                            case 2:
                                garbages[3].tl.fadeIn(20);
                                garbages[4].tl.fadeIn(20);
                            case 1:
                                garbages[0].tl.fadeIn(20);
                                garbages[2].tl.fadeIn(20);

                        }
                    }


                    

                } else if (sub_timer == 230) {

                    if (g_max) {
                        // ラベルの再表示
                        label1.text = ">Star's capacity is FULL."
                        label1.x = 60;
                        label1.y = 135;
                        label1.opacity = 1;
                        label2 = new Label();
                        label2.color = "#ffffff";
                        label2.font = "13px sans-serif";
                        label2.text = "explode -star " + STARS[game.star_id];
                        label2.x = 60;
                        label2.y = 135 + 13;
                        game.currentScene.addChild(label1);
                        game.currentScene.addChild(label2);
                        sound_play(beep_se);
                        label1.tl.delay(27).fadeOut(1).delay(8).fadeIn(1).loop();
                        label2.tl.delay(27).fadeOut(1).delay(8).fadeIn(1).loop();
                        /*

                        */
                    } else {
                        for (var i=0;i<garbages.length;i++) {
                          garbages[i].tl.fadeOut(10);
                        }
                        sprite1.tl.fadeOut(10);
                        sprite2.tl.fadeOut(10);
                        sprite3.tl.fadeOut(10);
                    }
                } else if (sub_timer == 240 && !g_max)  {
                    gamelimit_timer += 10;
                    game.score += game_balance_tempo * 10;
                    game.popScene();
                } else if ((sub_timer - 230) % 37 == 0 && g_max && sub_timer < 315 && sub_timer > 230) {
                    sound_play(beep_se);
                } else if (sub_timer == 315 && g_max) {
                    // ラベルの消去
                    label1.tl.unloop();
                    label1.tl.removeFromScene();
                    label2.tl.unloop();
                    label2.tl.removeFromScene();

                } else if(sub_timer == 340 && g_max) {
                    // 星の爆破
                    sound_play(fire2_se);
                    for (var i=0;i<garbages.length;i++) {
                      garbages[i].opacity = 0;
                    }
                    sprite3.tl.delay(10).fadeOut(15);
                    // 爆発スプライト
                    explode = new Sprite(64, 64);
                    explode.image = game.assets['img/explode.png'];                     
                    explode.moveTo(160 - 32, 50 + 10);
                    explode.scale(1.6, 1.6);
                    explode.opacity = 0.8
                    explode.tl.scaleTo(2, 2, 30);
                    game.currentScene.addChild(explode);
                } else if (sub_timer > 340 && sub_timer <= 340 + 30 && g_max) {
                    explode.frame += 1;
                } else if (sub_timer == 371) {
                    if (g_max) {
                        explode.tl.fadeOut(5);
                    }
                } else if (sub_timer == 391) {
                    sprite1.tl.fadeOut(10);
                    sprite2.tl.fadeOut(10);
                } else if (sub_timer == 400 && g_max) {
                    // 加算処理
                    game.star_garbage = 0;
                    if (game.star_id >= 4) {
                        gamelimit_timer += 35;
                    } else {
                        gamelimit_timer += (25 + game.star_id * 15)
                    }
                    game.star_id += 1;
                    game.score += game.star_id * 1000;
                    game.popScene();
                    // 進行度に応じて処理
                    if (game.star_id == 4) {
                        change_background_flag = true;
                        change_unit_speed_flag = true;
                        game.difficult = true;
                    } else if (game.star_id >= STARS.length) {
                        if (bgm) {
                            bgm.stop();
                        }
                        // ゲームクリア
                        call_gamescore_scene = 50;
                        for(var i=0;i<units.length;i++) {
                          units[i].tl.delay(10).fadeOut(35);
                        }
                    }
                    
                }

                sub_timer++;
            });
        }

        function showScoreScene() {
            //game.popScene();
            bgm.stop();
            game.pushScene(new Scene());
            var back_sprite = new Sprite(320, 320);
            var star_sprites = [];

            back_sprite.image = game.assets["img/black.png"];
            back_sprite.opacity = 0;
            back_sprite.tl.fadeTo(0.75, 50);
            game.currentScene.addChild(back_sprite);
            var sub_timer = 1;
            var s_index = 0;
            var showed_star = false;
            var label1;
            var label2;
            var add_delta = parseInt(game.score / (game.fps * 2.5)) + 1;
            var call_gameend = 0;
            game.currentScene.addEventListener('enterframe', function() {
                if (sub_timer == 80) {
                    label1 = new Label();
                    label1.text = "Your SCORE"
                    label1.moveTo(10, 10);
                    label1.color = "#ffffff";
                    label1.font = "20px sans-serif";
                    game.currentScene.addChild(label1);
                    label2 = new Label();
                    label2.moveTo(105, 60);
                    label2.text = "0";
                    label2.color = "#ffffff";
                    label2.font = "35px sans-serif";
                    label2.num = 0;
                    label2.opacity = 0;
                    game.currentScene.addChild(label2);
                }
                if (sub_timer >= 140 && (sub_timer - 140) % 25 == 0) {
                    if (s_index < game.star_id) {
                        var im = game.assets["img/"+STARS[s_index] + ".png"];
                        var sp = new Sprite(im.width, im.height);
                        sp.image = im;
                        sp.opacity = 0;
                        sp.scale(3, 3);
                        star_sprites.push(sp);
                        if (s_index == 5) {
                            sp.moveTo(10 ,140 - im.height / 2 + 55 + 5);
                        } else if (s_index > 0) {
                            var sp2 = star_sprites[s_index - 1];
                            sp.x = sp2.x + ~~(sp2.image.width * 0.8);
                            sp.y = 140 - im.height / 2 + (60 * ~~(s_index / 5));
                        } else {
                            sp.moveTo(10 ,140 - im.height / 2);
                        }
                        sp.tl.fadeIn(20).and().scaleTo(0.8, 0.8, 20);
                        game.currentScene.addChild(sp);
                        sound_play(show_se, true);
                        s_index++;
                    } else {
                        label2.tl.fadeIn(15);
                        showed_star = true;
                    }
                } else if (showed_star) {
                    if (label2.num < game.score) {
                        label2.num += add_delta;
                    }
                    if (label2.num >= game.score) {
                        label2.num = game.score;
                        if (call_gameend == 0) {
                            call_gameend = 60;
                        }
                    }
                    label2.text = String(label2.num);
                }
                if (call_gameend > 0) {
                    call_gameend--;
                    if (call_gameend == 0) {
                        var msg;
                        switch(game.star_id) {
                            case 0:
                                msg = "到達:地球";
                                break;
                            case 1:
                                msg = "到達:月";
                                break;
                            case 2:
                                msg = "到達:火星";
                                break;
                            case 3:
                                msg = "到達:木星";
                                break;
                            case 4:
                                msg = "到達:土星";
                                break;
                            case 5:
                                msg = "到達:彗星";
                                break;
                            case 6:
                                msg = "到達:Spiderβ";
                                break;
                            case 7:
                                msg = "到達:アルファ・ケンタウリ";
                                break;
                            case 8:
                                msg = "到達:シリウス星";
                            case 9:
                                msg = "GAME ALL CLEAR!"
                        }
                        game.end(game.score, msg);
                    }
                }
                sub_timer++;
            });
        }
        function updateLimitTimer() {
            gametimer_sprites[0].frame = gamelimit_timer / 100;
            gametimer_sprites[1].frame = (gamelimit_timer % 100) / 10;
            gametimer_sprites[2].frame = (gamelimit_timer % 10)

            if (gamelimit_timer <= 0) {
                gametimer_sprites[0].frame = gametimer_sprites[1].frame = gametimer_sprites[2].frame = 0;
            }
            if ((gamelimit_timer == 30) || (gamelimit_timer == 10) || (gamelimit_timer == 0))  {
                for(var i = 0;i<3;i++) {
                    // 振動
                    gametimer_sprites[i].tl.scaleTo(1, 1.2, 10).delay(4).scaleTo(1.0, 1.0, 10);
                }
                sound_play(timedown_se);
            }
            if (gamelimit_timer == 0) {
                call_gamescore_scene = 50;
                for(var i=0;i<units.length;i++) {
                    units[i].tl.delay(10).fadeOut(35);
                }
            }
        }

        function getCanInsertDirection() {
            if (units.length > 7 || change_unit_speed_flag) {
                return [];
            }
            var foo = [true, true, true, true]
            var theta_ = [];
            theta_[0] = (135 + 2 * 90 ) % 360;
            theta_[1] = (225 + 2 * 90) % 360;
            theta_[2] = (315 + 2 * 90) % 360;
            theta_[3] = (45 + 2 * 90) % 360;
            var r_ = [];

            // 基準 135, 225, 315, 45
            for (var i = 0;i<units.length;i++) {
                var u = units[i];
                if (u.r > 75) {
                    if (Math.abs(u.r - 150) <= 1) {
                        if (Math.abs(u.theta - 225) <= 1) {
                            foo[0] = false;
                        }
                        else if (Math.abs(u.theta - 315) <= 1) {
                            foo[1] = false;
                        }
                        else if (Math.abs(u.theta - 45) <= 1) {
                            foo[2] = false;
                        }
                        else if (Math.abs(u.theta - 135) <= 1) {
                            foo[3] = false;
                        }
                    }
                } else {
                    // 90frame後での衝突を見る
                    if (Math.abs(theta_[0] - u.theta ) <= game.unit_speed * 6) {
                        foo[0] = false;
                    } else if (Math.abs(theta_[1] - u.theta)<= game.unit_speed * 3) {
                        foo[1] = false;
                    } else if (Math.abs(theta_[2] - u.theta) <= game.unit_speed * 3) {
                        foo[2] = false;
                    } else if (Math.abs(theta_[3] - u.theta)<= game.unit_speed * 3) {
                        foo[3] = false;
                    }
                }
            }
            var bar = [];
            for (var i = 0;i<4;i++) {
                if (foo[i]) {
                    bar.push(i + 1);
                }
            }
            return bar;
        }
    };
    game.onload = game_main_process;
    game.start();

}