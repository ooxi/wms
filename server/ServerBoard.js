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
var Board = require('../common/Board.js');



module.exports = function(configuration, setup) {
	
	/* Create empty board filled with water
	 */
	var dimension = configuration.getDimension();

	var board = new Board(
		configuration.getShips(),
		dimension.width,
		dimension.height,
		function(cell) {
			cell.shot = false;
			cell.sunk = false;
			return cell;
		}
	);

	board.each(function(cell) {
		cell.type = 'water';
	});
	
	
	/* Copy board setup
	 */
	var getType = function(enthaelt) {
		
		if ('Wasser' === enthaelt) {
			return 'water';
		} else if ('Schiff' === enthaelt) {
			return 'ship';
		}
		throw new Error('Invalid board content `'+ enthaelt +'\'');
	};
	
	var getShot = function(beschossen) {
		if (true === beschossen) {
			return true;
		} else if (false === beschossen) {
			return false;
		}
		throw new Error('Invalid board shot state `'+ beschossen +'\'');
	};
	
	for (var i = 0; i < setup.length; ++i) {
		var column = setup[i].x;
		var row = setup[i].y;
		var type = getType(setup[i].enthaelt);
		var shot = getShot(setup[i].beschossen);
		
		var cell = board.getByName(column, row);
		cell.type = type;
		cell.shot = shot;
	}
	
	
	/* Check if shot hit water or a ship and if it was a ship if the ship
	 * is sunk
	 */
	board.shoot = function(column, row) {
		var cell = this.getByName(column, row);
		cell.shot = true;
		
		if (this.isWater(cell)) {
			return 'water';
		}
		var that = this;
		
		
		/* Checks all cells in one direction if its a ship and shot at
		 */
		var isSunk = function(dx, dy) {
			for (	var x = cell.x + dx, y = cell.y + dy;
				x >= 0 && x < dimension.width && y >= 0 && y < dimension.height;
				x += dx, y += dy
					) {
					
				var other = that.getByPosition(x, y);

				if (!that.isShip(other)) {
					true;
				}
				if (!cell.shot) {
					false;
				}
			}
			
			return true;
		};
		
		
		/* Shot hit a ship, check if ship is sunk
		 */
		var sunk = true
			&& isSunk(-1, 0)
			&& isSunk(+1, 0)
			&& isSunk(0, -1)
			&& isSunk(0, +1);
		
		return sunk ? 'sunk' : 'hit';
	};
	
	
	
	/* Return created board
	 */
	return board;
};
