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
var Player = require('./Player.js');





module.exports = function() {
	
	var _self = this;
	var _players = [];
	
	
	
	
	
	this.addPlayer = function(player) {
		
		if (!(player instanceof Player)) {
			throw 'Argument must be an instance of player'
		}
		if (_self.getPlayerCount() >= 2) {
			throw 'Game is full!';
		}
		if (_self.hasFinished()) {
			throw 'Game already finished!';
		}
		
		_players.push(player);
		
		/* Tell random player it's her turn
		 */
		var next_player = Math.floor(_players.length * Math.random());
		_players[next_player].itIsYourTurn();
	};
	
	
	
	this.getPlayerCount = function() {
		return _players.length;
	};
	
	
	
	this.getPlayer = function(token) {
		
		for (var i = 0; i < _players.length; ++i) {
			var player = _players[i];
			
			if (player.getToken() === token) {
				return player;
			}
		}
		
		throw 'No player with token `'+ token +'\' known to game';
	};
	
	this.getOtherPlayer = function(player) {
		if (2 !== _players.length) {
			throw new Error('There have to be two players in game to determine the other');
		}
		
		if ((_players[0].getToken() === player.getToken()) && (_players[1].getToken() !== player.getToken())) {
			return _players[1];
		}
		if ((_players[1].getToken() === player.getToken()) && (_players[0].getToken() !== player.getToken())) {
			return _players[0];
		}
		throw new Error('Player with token `'+ player.getToken() +'\' not in current game');
	};
	
	
	
	
	
	this.hasFinished = function() {
		
		/* Not finished, still waiting for players
		 */
		if (2 !== _players.length) {
			return false;
		}
		
		/* Finished if somebody won
		 */
		return _players[0].hasWon() || _players[1].hasWon();
	};
	
	
	
	this.shoot = function(player, column, row) {
		var other = this.getOtherPlayer(player);
		var result = other.shoot(column, row);
		other.itIsYourTurn();
		return result;
	};
};
