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
var BoardUtilities = require('./../common/BoardUtilities.js');
var DefensiveBoard = require('./DefensiveBoard.js');



module.exports = function(expected_ships, width, height) {
	
	
	/**
	 * @return {DefensiveBoard} A random board (not necessarly valid)
	 */
	this.getRandomBoard = function() {
		
		/* Create an empty board filled with water
		 */
		var board = new DefensiveBoard(expected_ships, width, height);
		
		board.each(function(cell) {
			cell.type = 'water';
		});
		
		
		/**
		 * @return true iff. the surroundings of a ship are no ships
		 */
		var isSpaceAvailable = function(x, y, length, is_horizontal) {
			var start_x = x - 1;
			var start_y = y - 1;
			var end_x = is_horizontal ? x + length : x + 1;
			var end_y = is_horizontal ? y + 1 : y + length;
			
//			console.log('Will test from '+ BoardUtilities.PositionToName(start_x, start_y) +' to '+ BoardUtilities.PositionToName(end_x, end_y));
			
			for (var ix = start_x; ix <= end_x; ++ix) {
				for (var iy = start_y; iy <= end_y; ++iy) {
					var cell = board.getByPosition(ix, iy);
//					console.log('\tCell at '+ BoardUtilities.PositionToName(ix, iy), cell);

					if (board.isShip(cell)) {
						return false;
					}
				}
			}
			
			return true;
		};
		
		
		/* @return A position where the ship could be placed without
		 *     obviously beeing wrong
		 */
		var getRandomPosition = function(length, is_horizontal) {
			var available_width = is_horizontal ? (width - length + 1) : width;
			var available_height = is_horizontal ? height : (height - length + 1);
			var max_tests = 100;
			
			for (var test = 0; test < max_tests; ++test) {
				var x = Math.floor(available_width * Math.random());
				var y = Math.floor(available_height * Math.random());

				if (isSpaceAvailable(x, y, length, is_horizontal)) {
					return {
						x:	x,
						y:	y
					};
				}
			}
			
			console.log('Giving up on ship with length `'+ length +'\'');
			return false;
		};
		
		
		/* Start with the biggest ship otherwise it could take too long
		 * to get a valid board
		 */
//		var ships = Object.keys(expected_ships);
//		ships.sort(function(a, b) {
//			return b - 1;
//		});
		
		/* Randomly place ships on board
		 */
		var unplaced_ships = JSON.parse(JSON.stringify(expected_ships));
		
		while (Object.keys(unplaced_ships).length > 0) {
			var ships = Object.keys(unplaced_ships);
			var ship = BoardUtilities.getRandomElement(ships);
			delete unplaced_ships[ship];
			
			for (var i = 0; i < expected_ships[ship]; ++i) {
				var length = parseInt(ship);
				var is_horizontal = Math.random() >= 0.5;
				var position = getRandomPosition(length, is_horizontal);
				
				if (false === position) {
					return false;
				}
//				console.log('Will add ship `'+ ship +'\' `'+ (is_horizontal ? 'horizontally' : 'vertically') +'\' at `'+ BoardUtilities.PositionToName(position.x, position.y) +'\'');
				board.addShip(position.x, position.y, length, is_horizontal);
			}
		}

		return board;
	};
	
	
	
	/**
	 * @return {DefensiveBoard} A valid random board
	 */
	this.getField = function(cb) {
		var board;

		do {
			console.log('Trying to create a random board...');
			board = this.getRandomBoard();
		} while ((false === board) || !board.isValid());
		
		cb(null, board);
	};
};
