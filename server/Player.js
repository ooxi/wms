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
var Token = require('./Token.js');
var Board = require('./../common/Board.js');





module.exports = function() {
	
	var _token = Token();
	var _board = null;
	
	var _won = false;
	var _lost = false;
	
	/**
	 * @var {boolean} true iff this player may draw
	 */
	var _turn = false;
	
	/**
	 * @var {array of callback} List of callbacks which will be invoked
	 *     as soon as this player is allowed to draw
	 */
	var _shot = undefined;
	var _on_turn = [];
	
	
	
	
	
	this.getToken = function() {
		return _token;
	};
	
	this.setBoard = function(board) {
		
		if (!(board instanceof Board)) {
			throw 'Argument has to be an instance of Board';
		}
		if (null !== _board) {
			throw 'Board already set';
		}
		
		_board = board;
	};
	
	
	
	/**
	 * Will be invoked by the game to tell the player it's her turn
	 */
	this.itIsYourTurn = function(shot) {
		_turn = true;
		_shot = shot;
		
		var callbacks = _on_turn;
		_on_turn = [];
		
		for (var i = 0; i < callbacks.length; ++i) {
			try {
				callbacks[i](_shot);
			} catch (e) {
				console.log('Caught unexpected exception while notifing callbacks of player `'+ this.getToken() +'\'', e);
			}
		}
	};
	
	/**
	 * Registers a callback to be invoked as soon as this player may draw
	 * (can be instant)
	 */
	this.onTurn = function(cb) {
		if (_turn) {
			cb(_shot);
		} else {
			_on_turn.push(cb);
		}
	};
	
	
	
	/**
	 * @return true iff it's the player's turn
	 */
	this.hasTurn = function() {
		return _turn;
	};
	
	/**
	 * @return true iff player has won
	 */
	this.hasWon = function() {
		return _won;
	};
	
	/**
	 * @return true iff player has lost
	 */
	this.hasLost = function() {
		return _lost;
	};
	
	
	
	/**
	 * Enemy shoots at player's board
	 */
	this.shoot = function(column, row) {
		return _board.shoot(column, row);
	};
};
