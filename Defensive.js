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
 * Versucht Schiffe so aufzustellen, dass sie moeglichst schwer zu treffen sind
 */
module.exports = function(width, height) {
	
	/* Felder initialisieren
	 */
	var field = [];
	
	for (var ix = 0; ix < width; ++ix) {
		var row = [];
		
		for (var iy = 0; iy < height; ++iy) {
			row.push({
				x:		BoardUtilities.IntegerToColumn(ix),
				y:		BoardUtilities.IntegerToRow(iy),
				
				enthaelt:	"Wasser",
				beschossen:	false
			});
		}
		
		field.push(row);
	}
	
	
	
	
	
	this.setShip = function(x, y, width, height) {
		for (var ix = 0; ix < width; ++ix) {
			for (var iy = 0; iy < height; ++iy) {
				var cell = field[x + ix][y + iy];
				cell.enthaelt = "Schiff";
			}
		}
	};
	
	
	
	this.getField = function() {
		var flat = [];
		
		for (var ix = 0; ix < field.length; ++ix) {
			for (var iy = 0; iy < field[ix].length; ++iy) {
				flat.push(field[ix][iy]);
			}
		}
		
		return flat;
	};
	
	
	
	this.setEnemyShot = function(x, y) {
		field[x][y].beschossen = true;
	}
	
	
	
	this.getHtml = function() {
		var html = '<h1>Defensive</h1><table>';
		
		html += '<tr><td>&nbsp;</td>';
		for (var x = 0; x < width; ++x) {
			html += '<th>'+ BoardUtilities.IntegerToColumn(x) +'</th>';
		}
		html += '</tr>';
		
		for (var y = 0; y < height; ++y) {
			html += '<tr><th>'+ BoardUtilities.IntegerToRow(y) +'</th>';
			
			for (var x = 0; x < width; ++x) {
				var cell = field[x][y];
				html += '<td style="width: 30px; height: 30px; text-align: center; vertical-align: middle; color: white; font-size: 20px; background-color: '+ ('Wasser' === cell.enthaelt ? 'blue' : 'red') +'">'+ (cell.beschossen ? '&times;' :'&nbsp;') +'</td>';
			}
			html += '</tr>';
		}
		
		html += '</table>';
		return html;
	};
	
	
	
	/**
	 * Distributes a given amout of ships on the field (if possible in
	 * n tries)
	 */
	this.distribute = function(ships, tries) {
		
		var try_distribute = function(ships) {
			
			for (var ship = get_next_ship(ships); false !== ship; ship = get_next_ship(ships)) {
				var open = get_open_fields();
				
				for (var i = 0; i < tries; ++i) {
					var on = BoardUtilities.getRandomElement(open);
					
					if (try_place(ship, on)) {
						break;
					}
				}
			}
		};
		
		
		
		/* @return true iff a ship of length could be placed somehow
		 *     on that field
		 */
		var try_place = function(ship, field) {
			
			/* Get random position and orientation
			 */
			var x = Math.floor(Math.random() * width);
			var y = Math.floor(Math.random() * height);
			var is_horizontal = Math.random() > 0.5;
			
			/* Don't even need to test
			 */
			if (is_horizontal && (x + ship >= width)) {
				return false;
			}
			if (!is_horizontal && (y + ship >= height)) {
				return false;
			}
			
			/* Try with clone of field
			 */
			var field_clone = JSON.parse(JSON.stringify(field));
			
			if (is_horizontal) {
				for (var ix = x; ix < ship; ++ix) {
					field_clone[ix][y].enthaelt = "Schiff";
				}
			} else {
				for (var iy = y; iy < ship; ++iy) {
					field_clone[x][iy].enthaelt = "Schiff";
				}
			}
			
			if (is_field_valid(field_clone)) {
				field = field_clone;
				return true;
			} else {
				return false;
			}
		};
		
		
		
		/* @return true iff field is valid
		 */
		var is_field_valid = function(field) {
			
		};
		
		
		
		/* @return Array of fields which can be used to place a ship
		 *     on
		 */
		var get_open_fields = function() {
			var open = [];
			
			for (var x = 0; x < width; ++x) {
				for (var y = 0; y < height; ++y) {
					if (("Wasser" === field[x][y].enthaelt) && (!field[x][y].beschossen)) {
						open.push(field);
					}
				}
			}
			
			return open;
		};
		
		
		
		/* @return Next ship to place
		 */
		var get_next_ship = function(ships) {
			var keys = Object.keys(ships);
			
			if (0 === keys.length) {
				return false;
			}
			
			var ship = BoardUtilities.getRandomElement(keys);
			ships[ship]--;
			
			if (0 === ships[ship]) {
				delete ships[ship];
			}
			return ship;
		};
		
		
		
		/* Resets all fields to "Wasser"
		 */
		var reset = function() {
			for (var x = 0; x < width; ++x) {
				for (var y = 0; y < height; ++y) {
					field[x][y].enthaelt = "Wasser";
					field[x][y].beschossen = false;
				}
			}
		};
		
		
		
		/* Try distribution until max tries reached
		 */
		for (var i = 0; i < tries; ++i) {
			var clone = JSON.parse(JSON.stringify(ships));
			if (try_distribute(clone)) {
				return;
			}
		}
		throw 'Failed distributing ships after `'+ tries +'\' tries';
	};
	
	
	
	
	
	/**
	 * @warning Legacy
	 */
//	this.distribute({
//		5: 1,
//		4: 2,
//		3: 3,
//		2: 1
//	}, 5);

	this.setShip(0, 0, 1, 5);
	this.setShip(2, 0, 1, 4);
	this.setShip(2, 5, 1, 4);
	this.setShip(4, 0, 1, 3);
	this.setShip(4, 4, 1, 3);
	this.setShip(6, 0, 1, 3);
	this.setShip(6, 4, 1, 2);
	this.setShip(6, 7, 1, 2);
	this.setShip(8, 0, 1, 2);
	this.setShip(8, 3, 1, 2);
};
