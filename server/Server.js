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
var Game = require('./Game.js');
var Player = require('./Player.js');
var ServerBoard = require('./ServerBoard.js');
var SimpleHttpServer = require('./SimpleHttpServer.js');





module.exports = function(configuration, port) {
	
	/* Games identified by game id
	 */
	var _games = {};
	
	
	
	
	
	/**
	 * Sends a list of available games
	 */
	var list_games = function(res) {
		var games = [];
		
		for (var id in _games) {
			var game = _games[id];
			
			games.push({
				gameId:		id,
				playerCount:	game.getPlayerCount(),
				hasFinished:	game.hasFinished()
			});
		}
		
		answer(res, games);
	};
	
	
	
	/**
	 * Creates a new game
	 */
	var create_game = function(res, id) {
		
		if (_games.hasOwnProperty(id)) {
			return error(res, 'DENIED', 'Game `'+ id +'\' already exists');
		}
		var game = new Game();
		var player = new Player();
		
		game.addPlayer(player);
		_games[id] = game;
		console.log('Player `'+ player.getToken() +'\' created game `'+ id +'\'');
		
		answer(res, {
			status:	'OK',
			token:	player.getToken()
		});
	};
	
	
	
	/**
	 * Let's a player join an existing game
	 */
	var join_game = function(res, game_id) {
		
		if (!_games.hasOwnProperty(game_id)) {
			return error(res, 'DENIED', 'Game `'+ game_id +'\' does not exist');
		}
		var game = _games[game_id];
		var player = new Player();
		
		game.addPlayer(player);
		console.log('Player `'+ player.getToken() +'\' joined game `'+ game_id +'\'');
		
		answer(res, {
			status:	'JOINED',
			token:	player.getToken()
		});
	};
	
	
	
	/**
	 * Spawns ships on a game
	 */
	var spawn_ships = function(res, game_id, player_token, setup) {
		
		/* Read game and player from id and token
		 */
		if (!_games.hasOwnProperty(game_id)) {
			return error('DENIED', 'Game `'+ game_id +'\' does not exist');
		}
		var game = _games[game_id];
		var player = game.getPlayer(player_token);
		
		/* Read board configuration from request
		 */
		var board = new ServerBoard(configuration, setup);
		player.setBoard(board);
		console.log('Player `'+ player.getToken() +'\' spawned her ships');
		
		return answer(res, {
			status:	'OK'
		});
	};
	
	
	
	/**
	 * Waits until it's the player's turn
	 */
	var wait = function(res, game_id, player_token) {
		
		/* Read game and player from id and token
		 */
		if (!_games.hasOwnProperty(game_id)) {
			return error('DENIED', 'Game `'+ game_id +'\' does not exist');
		}
		var game = _games[game_id];
		var player = game.getPlayer(player_token);
		
		
		/* Callback will be invoked as soon as player may draw
		 */
		console.log('Player `'+ player.getToken() +'\' is waiting for her turn');
		
		var on_turn = function(shot) {
			var result = {
				status:	'you are next'
			};
			if (player.hasWon()) {
				result.status = 'you won';
			} else if (player.hasLost()) {
				result.status = 'you lost';
			}
			if (shot) {
				result.enemyshot = shot;
			}
			
			console.log('Player `'+ player.getToken() +'\' has waited long enough, will tell her `'+ JSON.stringify(result) +'\'');
			answer(res, result);
		};
		
		
		/* Wait for player's turn
		 */
		player.onTurn(on_turn);
	};
	
	
	
	/**
	 * Player wants to shoot
	 */
	var shoot = function(res, game_id, player_token, column, row) {
		
		/* Read game and player from id and token
		 */
		if (!_games.hasOwnProperty(game_id)) {
			return error('DENIED', 'Game `'+ game_id +'\' does not exist');
		}
		var game = _games[game_id];
		var player = game.getPlayer(player_token);
		
		
		/* If it's not the player's turn abort
		 */
		if (!player.hasTurn()) {
			return error('DENIED', 'It\'s not your turn, go away');
		}
		
		/* Shoot and return result
		 */
		answer(res, {
			status:	'OK',
			result:	game.shoot(player, column, row)
		});
	};
	
	
	
	
	
	/**
	 * Sends an answer to the client
	 */
	var answer = function(res, result) {
		
		res.writeHead(200, {
			'Content-Type':	'application/json'
		});
		res.end(JSON.stringify(result));
	};
	
	
	
	/**
	 * Sends an error to the client
	 */
	var error = function(res, status, reason) {
		console.error(status, reason);
		
		res.writeHead(200, {
			'Content-Type':	'application/json'
		});
		res.end(JSON.stringify({
			status:	status,
			reason:	reason
		}));
	};
	
	
	
	
	
	/* Start server and distribute incoming requests
	 */
	SimpleHttpServer(function(req, res) {
		var method = req.method.toUpperCase();
		var path = req.url.substr(1).split('/');
		
		try {
			if ('PUT' === method) {

				/* Create new game
				 */
				if (1 === path.length) {
					return create_game(res, path[0]);
				}

				/* Spawn ships
				 */
				if ((3 === path.length) && ('setup' === path[1])) {
					return spawn_ships(res, path[0], path[2], req.json);
				}
				
				/* Shoot
				 */
				if ((5 === path.length) && ('shot' === path[1])) {
					return shoot(res, path[0], path[2], path[3], path[4]);
				}
				
			} else if ('GET' === method) {

				/* List available games
				 */
				if ((1 === path.length) && ('games' === path[0])) {
					return list_games(res);
				}

				/* Join existing game
				 */
				if (1 === path.length) {
					return join_game(res, path[0]);
				}
				
				/* Wait for turn
				 */
				if ((3 === path.length) && ('wait' === path[1])) {
					return wait(res, path[0], path[2]);
				}
			}
	
		/* Propagate errors to frontend
		 */
		} catch (e) {
			return error(res, 'EXCEPTION', e);
		}
		
		
		/* Unknown request
		 */
		error(res, 'ERROR', 'Unknown request `'+ method +'\' `'+ req.url +'\'');
		
	}).listen(port);
};
