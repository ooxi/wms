/**
 * Copyright (c) 2013 github/ooxi
 * 
 * This software is provided 'as-is', without any express or implied warranty.
 * In no event will the authors be held liable for any damages arising from the
 * use of this software.
 * 
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 * 
 *  1. The origin of this software must not be misrepresented; you must not
 *     claim that you wrote the original software. If you use this software in a
 *     product, an acknowledgment in the product documentation would be
 *     appreciated but is not required.
 * 
 *  2. Altered source versions must be plainly marked as such, and must not be
 *     misrepresented as being the original software.
 * 
 *  3. This notice may not be removed or altered from any source distribution.
 */
var async = require('async');
var fs = require('fs');
var request = require('request');

var BoardUtilities = require('./BoardUtilities.js');

var NEXT_CLIENT_ID = 0;





/**
 * @param {string} server Server base URL
 * @param {type} aggressive Drawing implementation
 * @param {type} defensive Board setup implementation
 */
module.exports = function(server, aggressive, defensive) {
	
	/**
	 * Game state
	 */
	var name = NEXT_CLIENT_ID++;
	var game_id = null;
	var token = null;





	/**
	 * Debugging information
	 */
	var log = function(msg) {
		console.log('Client '+ name +': '+ msg);
	};
	
	
	
	
	
	/**
	 * Loads a list of games from the server
	 */
	var list_games = function(cb) {
		
		request.get(server +'/games', function(error, response, body) {
			if (error) {
				cb(error);
				return;
			}
			body = JSON.parse(body);

			cb(null, body);
		});
	};
	
	
	
	
	
	/**
	 * Joins an existing game or creates a new one if the existing games
	 * are all full
	 */
	var join_or_create_game = function(cb) {
		
		list_games(function(err, games) {
			if (err) {
				cb(err);
				return;
			}
			
			/* Join an existing game
			 */
			for (var i = 0; i < games.length; ++i) {
				var game = games[i];
				
				var players = game.playerCount;
				var finished = game.hasFinished;
				var id = game.gameId;
				
				if ((players < 2) && !finished) {
					join_game(id, cb);
					return;
				}
			}
			
			/* Could not join any game so we have to create a new
			 * game
			 */
			create_game(cb);
		});
	};
	
	
	
	/**
	 * Joins an existing game
	 */
	var join_game = function(game, cb) {
		log('Will join game `'+ game +'\'');
		
		request(server +'/'+ game, function(error, response, body) {
			if (error) {
				cb(error);
				return;
			}
			body = JSON.parse(body);
			
			if ('JOINED' !== body.status) {
				cb(body.status +' ('+ body.reason +')');
				return;
			}
			
			game_id = game;
			token = body.token;
			cb(null);
		});
	};
	
	
	
	/**
	 * Creates a new random game
	 */
	var create_game = function(cb) {
		game_id = parseInt(Math.random() * 10000);
		log('Will create game '+ game_id);

		request.put(server +'/'+ game_id, function(error, response, body) {
			if (error) {
				cb(error);
				return;
			}
			body = JSON.parse(body);

			if ('OK' !== body.status) {
				cb(body.reason);
				return;
			}

			token = body.token;
			cb(null);
		});
	};





	/**
	 * Schiffaufstellung
	 */
	var spawn_ships = function(cb) {

		request({
			url:	server +'/'+ game_id +'/setup/'+ token,
			method:	'PUT',
			body:	JSON.stringify(defensive.getField())
			
		}, function(error, response, body) {
			if (error) {
				cb(error);
				return;
			}
			body = JSON.parse(body);

			if ('OK' !== body.status) {
				cb(body.reason);
				return;
			}

			cb(null);
		});
	};
	
	
	
	
	
	/**
	 * Plays until game finished
	 */
	var play = function(cb) {
		var logfile = 'client_'+ name +'.html';
		
		if (fs.existsSync(logfile)) {
			fs.unlinkSync(logfile);
		}
		
		async.forever(
			function(cb) {
				async.series([
					wait,
					draw,
					
					function(cb) {
//						fs.appendFileSync(
//							logfile,
//							'<table><tr><td>'+ aggressive.getHtml() +'</td><td align="right">'+ defensive.getHtml() +'</td></tr></table>'
//						);
						cb(null);
					}
				], cb);
			}
			
		/* @warning HACK but I don't know another way to stop a forever
		 *     loop than to trigger an error
		 */
		, function(err) {
			if (err.hasOwnProperty('game-finished')) {
				cb(null, err);
			} else {
				cb(err);
			}
		});
	};
	
	
	
	/**
	 * Waits until client may draw
	 */
	var wait = function(cb) {
		log('Waiting for enemy...');
		
		request(server +'/'+ game_id +'/wait/'+ token, function(error, response, body) {
			if (error) {
				cb(error);
				return;
			}
			body = JSON.parse(body);
			
			/* Remember enemy shot
			 */
			if (body.hasOwnProperty('enemyshot')) {
				defensive.setEnemyShot(
					BoardUtilities.ColumnToInteger(body.enemyshot.x),
					BoardUtilities.RowToInteger(body.enemyshot.y)
				);
			}
			
			if ('you are next' === body.status) {
				log('It\'s my turn :)');
				cb(null);
			} else if ('you won' === body.status) {
				cb({
					'game-finished':	true,
					'won':			true
				});
			} else if ('you lost' === body.status) {
				cb({
					'game-finished':	true,
					'won':			false
				});
			} else {
				cb(body.status +' ('+ body.reason +')');
			}
		});
	};
	
	
	
	/**
	 * Fuehrt den naechsten Schuss durch
	 */
	var draw = function(cb) {
		log('Will draw...');
		
		var target = aggressive.getNextTarget();
		var column = BoardUtilities.IntegerToColumn(target.x);
		var row = BoardUtilities.IntegerToRow(target.y);
		
		request.put(server +'/'+ game_id +'/shot/'+ token +'/'+ column +'/'+ row, function(error, response, body) {
			log('x');
			
			if (error) {
				cb(error);
				return;
			}
			body = JSON.parse(body);
			
			if ('OK' !== body.status) {
				cb(body.status +' ('+ body.reason +')');
				return;
			}
			aggressive.setResult(target.x, target.y, body.result);
			
			cb(null);
		});
	};

	
	
	
	
	/**
	 * Executes the game
	 * 
	 * @param {callback} cb Will be invoked with game result as soon as game
	 *     finished
	 */
	return function(cb, on_started) {
		
		var after_start = function(cb) {
			if ('function' === typeof(on_started)) {
				on_started();
			}
			cb(null);
		};
		
		async.series([
			join_or_create_game,
			after_start,
			spawn_ships,
			play
		], function(err) {
			log('Game finished');
			cb.apply(null, arguments);
		});
	};
};
