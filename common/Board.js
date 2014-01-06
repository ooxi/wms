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
var BoardUtilities = require('./BoardUtilities.js');





/**
 * @param {object} expected_ships Ship configuraiton expected by this board (used for
 *     validation);
 * @param {type} width Board width
 * @param {type} height Board height
 * @param {function} init_cell Cell initialization helper (optional)
 */
module.exports = function(expected_ships, width, height, init_cell) {
	
	
	/* Cell initialization is optional
	 */
	if ('function' !== typeof(init_cell)) {
		init_cell = function(cell) {
			return cell;
		};
	}
	
	
	/* Build inital field
	 */
	var _field = (function() {
		var rows = [];
		
		for (var y = 0; y < height; ++y) {
			var row = [];
			
			for (var x = 0; x < width; ++x) {
				var cell = init_cell({
					x:	x,
					y:	y,
					column:	BoardUtilities.IntegerToColumn(x),
					row:	BoardUtilities.IntegerToRow(y),
					
					type:	'unknown'
				});
				
				if ('object' !== typeof(cell)) {
					throw new Error('Cell constructor `'+ init_cell +'\' did not return a cell object but `'+ cell +'\'');
				}
				row.push(cell);
			}
			rows.push(row);
		}
		
		return rows;
	})();
	
	var _self = this;
	
	
	
	
	
	this.getByPosition = function(x ,y) {
		if ((x < 0) || (x >= width) || (y < 0) || (y >= height)) {
			return init_cell({
				x:	x,
				y:	y,
				column:	false,
				row:	false,
				
				type:	'water'
			});
		};
		return _field[y][x];
	};
	
	this.getByName = function(column, row) {
		return _self.getByPosition(
			BoardUtilities.ColumnToInteger(column),
			BoardUtilities.RowToInteger(row)
		);
	};
	
	
	
	this.isUnknown = function(cell) {
		return 'unknown' === cell.type;
	};
	
	this.isWater = function(cell) {
		return 'water' === cell.type;
	};
	
	this.isShip = function(cell) {
		return 'ship' === cell.type;
	};
	
	
	
	this.isValid = function() {
		
		var ship_count = function(x, y) {
			return _self.isShip(_self.getByPosition(x, y)) ? 1 : 0;
		};


		/* Check overlapping ships
		 */
		for (var x = 0; x < width; ++x) {
			for (var y = 0; y < height; ++y) {
				var cell = _self.getByPosition(x, y);

				if (!_self.isShip(cell)) {
					continue;
				}

				/* Ships diagonally touching will cause an
				 * invalid board
				 */
				var diagonally = 0
					+ ship_count(x - 1, y - 1)
					+ ship_count(x + 1, y - 1)
					+ ship_count(x - 1, y + 1)
					+ ship_count(x + 1, y + 1);

				if (diagonally > 0) {
					console.log('Ship diagonally attached at `'+ BoardUtilities.PositionToName(x, y) +'\'')
					return false;
				}

				/* Horizontal und vertikal duerfen sich
				 * maximal zwei Schiffe beruehren aber
				 * nicht sowohl horizontal als auch
				 * vertikal gleichzeitig
				 */
				var horizontally = 0
					+ ship_count(x - 1, y)
					+ ship_count(x + 1, y);

				var vertically = 0
					+ ship_count(x, y + 1)
					+ ship_count(x, y - 1);

				if ((horizontally > 0) && (vertically > 0)) {
					return false;
				}
			}
		}
		
		
		/* Check ship count
		 */
		var actual_ships = {};
		
		for (var x = 0; x < width; ++x) {
			for (var y = 0; y < height; ++y) {
				var cell = _self.getByPosition(x, y);
				
				if (!_self.isShip(cell)) {
					continue;
				}
				if (cell.hasOwnProperty('alreadyCounted') && cell.alreadyCounted) {
					continue;
				}
				
				/* Ship not yet counted so it is the top left
				 * cell
				 */
				var length = 1;
				cell.alreadyCounted = true;
				
				for (var ix = x + 1; ix < width; ++ix) {
					var xcell = _self.getByPosition(ix, y);
					
					if (_self.isShip(xcell)) {
						++length;
						xcell.alreadyCounted = true;
					} else {
						break;
					}
				}
				
				for (var iy = y + 1; iy < height; ++iy) {
					var ycell = _self.getByPosition(x, iy);
					
					if (_self.isShip(ycell)) {
						++length;
						ycell.alreadyCounted = true;
					} else {
						break;
					}
				}
				
				/* Register ship
				 */
				if (!actual_ships.hasOwnProperty(length)) {
					actual_ships[length] = 0;
				}
				actual_ships[length]++;
			}
		}
		
		
		/* Reset counted attribute
		 */
		this.each(function(cell) {
			if (cell.hasOwnProperty('alreadyCounted')) {
				delete cell.alreadyCounted;
			}
		});
		
		
		/* Actual ships have to match real ships
		 */
		for (var actual_ship in actual_ships) {
			
			if (!expected_ships.hasOwnProperty(actual_ship)) {
				console.log('Invalid ship `'+ actual_ship +'\'');
				return false;
			}
			if (expected_ships[actual_ship] !== actual_ships[actual_ship]) {
				console.log('Expected `'+ expected_ships[actual_ship] +'\' ships of type `'+ actual_ship +'\' but there are `'+ actual_ships[actual_ship] +'\'');
				return false;
			}
		}
		
		/* Expected ships have to match actual ships
		 */
		for (var expected_ship in expected_ships) {
			
			if (!actual_ships.hasOwnProperty(expected_ship)) {
				console.log('Missing expected ship `'+ expected_ship +'\'');
				return false;
			}
		}
		
		
		/* Board valid :)
		 */
		return true;
	};
	
	
	
	/**
	 * Calls a callback with every cell in the field
	 */
	this.each = function(cb) {
		for (var i = 0; i < _field.length; ++i) {
			for (var j = 0; j < _field[i].length; ++j) {
				cb(_field[i][j]);
			}
		}
	};
	
	
	
	/**
	 * Adds a ship to board
	 * 
	 * @warning Call is not validated
	 */
	this.addShip = function(x, y, length, is_horizontal) {
		
		if (length < 0) {
			throw 'Invalid ship length `'+ length +'\'';
		}
		
		if (!!is_horizontal) {
			for (var ix = 0; ix < length; ++ix) {
				this.getByPosition(x + ix, y).type = 'ship';
			}
		} else {
			for (var iy = 0; iy < length; ++iy) {
				this.getByPosition(x, y + iy).type = 'ship';
			}
		}
	};
	

};
