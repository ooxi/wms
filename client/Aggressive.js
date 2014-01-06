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



/**
 * Keeps information about game board with rating which cells contain what
 * type with a certain propability
 */
module.exports = function(width, height) {
	
	
	/* Initially all cells are unknown and equally probably will contain a
	 * ship
	 */
	var field = [];
	
	for (var ix = 0; ix < width; ++ix) {
		var row = [];
		
		for (var iy = 0; iy < height; ++iy) {
			row.push({
				x:			ix,
				y:			iy,
				
				is:			'unknown',
				complete:		false,
				ship:			0.5,
				how_many_can_be_placed:	4
			});
		}
		
		field.push(row);
	}
	
	
	
	/* Last messages which sould be written next to debug output
	 */
	var count = 0;
	var messages = [];
	
	
	
	
	/**
	 * @return Cell or helper cell
	 */
	var get = function(x, y) {

		if ((x < 0) || (x >= width) || (y < 0) || (y >= height)) {
			return {
				x:		x,
				y:		y,
				
				is:			'water',
				complete:		true,
				ship:			0,
				how_many_can_be_placed:	0
			};
		}
		return field[x][y];
	};
	
	/**
	 * @return All unknown fields
	 */
	var get_unknown_fields = function() {
		var unknown = [];
		
		for (var x = 0; x < width; ++x) {
			for (var y = 0; y < height; ++y) {
				if ('unknown' === field[x][y].is) {
					unknown.push(field[x][y]);
				}
			}
		}
		
		return unknown;
	};
	
	
	
	

	/**
	 * If a ship is sunk all ship fields next to it have to be finish
	 */
	var mark_ship_complete = function(x, y) {
		
		var mark_water = function(cell) {
			if ('unknown' === cell.is) {
				cell.is = 'water';
				cell.complete = true;
				cell.ship = 0;
			}
		};
		
		var mark_complete = function(x, y) {
			var cell = get(x, y);
			
			if ('ship' !== cell.is) {
				return false;
			}
			cell.complete = true;
			cell.ship = 1;
			
			mark_water(get(x - 1, y));
			mark_water(get(x + 1, y));
			mark_water(get(x, y - 1));
			mark_water(get(x, y + 1));
			
			mark_water(get(x - 1, y - 1));
			mark_water(get(x + 1, y - 1));
			mark_water(get(x - 1, y + 1));
			mark_water(get(x + 1, y + 1));
			
			return true;
		};
		
		for (var ix = x; ix >= 0; --ix) {
			if (!mark_complete(ix, y)) {
				break;
			}
		}
		
		for (var ix = x; ix < width; ++ix) {
			if (!mark_complete(ix, y)) {
				break;
			}
		}
		
		for (var iy = y; iy >= 0; --iy) {
			if (!mark_complete(x, iy)) {
				break;
			}
		}
		
		for (var iy = y; iy < height; ++iy) {
			if (!mark_complete(x, iy)) {
				break;
			}
		}
	};
	
	
	
	/**
	 * Will be invoked as soon as a hit
	 */
	var update_ship_propabilities = function(x, y) {
		
		/* Unknown ship orientation
		 */
		var left = get(x - 1, y);
		var right = get(x + 1, y);
		var top = get(x, y - 1);
		var bottom = get(x, y + 1);
		
		if (		('ship' !== left.is)
			&&	('ship' !== right.is)
			&&	('ship' !== top.is)
			&&	('ship' !== bottom.is)) {
			
			if ('unknown' === left.is) {
				left.ship = 0.75;
			}
			if ('unknown' === right.is) {
				right.ship = 0.75;
			}
			if ('unknown' === top.is) {
				top.ship = 0.75;
			}
			if ('unknown' === bottom.is) {
				bottom.ship = 0.75;
			}
			return;
		}
		
		
		/* top-down orientation
		 */
		if (('ship' === top.is) || ('ship' === bottom.is)) {
			
			for (var iy = y; iy >= 0; --iy) {
				var of = get(x, iy);
				
				if ('unknown' === of.is) {
					of.ship = 0.9;
				}
				if ('ship' !== of.is) {
					break;
				}
				var left_of = get(x - 1, iy);
				var right_of = get(x + 1, iy);
				
				left_of.is = right_of.is = 'water';
				left_of.complete = right_of.complete = true;
				left_of.ship = right_of.ship = 0;
			}
			
			for (var iy = y; iy < height; ++iy) {
				var of = get(x, iy);
				
				if ('unknown' === of.is) {
					of.ship = 0.9;
				}
				if ('ship' !== of.is) {
					break;
				}
				var left_of = get(x - 1, iy);
				var right_of = get(x + 1, iy);
				
				left_of.is = right_of.is = 'water';
				left_of.complete = right_of.complete = true;
				left_of.ship = right_of.ship = 0;
			}
			
		/* left-right orientation
		 */
		} else {
			
			for (var ix = x; ix >= 0; --ix) {
				var of = get(ix, y);
				
				if ('unknown' === of.is) {
					of.ship = 0.9;
				}
				if ('ship' !== of.is) {
					break;
				}
				var top_of = get(ix, y - 1);
				var bottom_of = get(ix, y + 1);
				
				top_of.is = bottom_of.is = 'water';
				top_of.complete = bottom_of.complete = true;
				top_of.ship = bottom_of.ship = 0;
			}
			
			for (var ix = x; ix < width; ++ix) {
				var of = get(ix, y);
				
				if ('unknown' === of.is) {
					of.ship = 0.9;
				}
				if ('ship' !== of.is) {
					break;
				}
				var top_of = get(ix, y - 1);
				var bottom_of = get(ix, y + 1);
				
				top_of.is = bottom_of.is = 'water';
				top_of.complete = bottom_of.complete = true;
				top_of.ship = bottom_of.ship = 0;
			}
		}
	};
	
	
	
	/**
	 * @return Alive enemy ships
	 */
	var get_remaining_enemy_ships = function() {
		return {
			5:	1,
			4:	2,
			3:	3,
			2:	4
		};
	};
	
	
	
	/**
	 * Tries to find fields which can never be populated by a ship and marks
	 * them as water (for example an unknown field which is surrounded by
	 * water
	 */
	var update_unreachable_fields = function() {
		var updated = false;
		
		
		/* @return Number of fields available in one direction
		 */
		var get_available = function(x, y, dx, dy) {
			var available = 0;
			
			for (ix = x, iy = y; ix >= 0 && ix < width && iy >= 0 && iy < height && 'water' !== get(ix, iy).is; ix += dx, iy += dy) {
//				messages.push(''+ BoardUtilities.IntegerToColumn(ix) +':'+ BoardUtilities.IntegerToRow(iy) +' is available (is '+ get(ix, iy).is +')');
				available++;
			}
			return available - 1;
		};
		
		/* @return true iff a ship of size `length' can somehow be
		 *     placed that it reaches this field
		 */
		var can_place = function(ships, x, y) {
			var top_available = get_available(x, y, 0, -1);
			var bottom_available = get_available(x, y, 0, +1);
			var left_available = get_available(x, y, -1, 0);
			var right_available = get_available(x, y, +1, 0);
			
			var horizontal = left_available + 1 + right_available;
			var vertical = top_available + 1 + bottom_available;
//			messages.push('horizontal available at '+ BoardUtilities.IntegerToColumn(x) +':'+ BoardUtilities.IntegerToRow(y) +': '+ horizontal);
//			messages.push('vertical available at '+ BoardUtilities.IntegerToColumn(x) +':'+ BoardUtilities.IntegerToRow(y) +': '+ vertical);
			
			/* Can at least one ship be placed?
			 */
			var how_many_can_be_placed = 0;
			
			for (var i = 0; i < ships.length; ++i) {
				var ship = ships[i];
				
				if (ship <= horizontal || ship <= vertical) {
					how_many_can_be_placed++;
				}
			}
			get(x, y).how_many_can_be_placed = how_many_can_be_placed;
			return how_many_can_be_placed > 0;
		};
		
		/* Get remaining enemy ship classes
		 */
		var ships = Object.keys(get_remaining_enemy_ships());
		
		for (var x = 0; x < width; ++x) {
			for (var y = 0; y < height; ++y) {
				var cell = get(x, y);
				
				if ('unknown' !== cell.is) {
					continue;
				}
				
				if (!can_place(ships, x, y)) {
					messages.push('Cannot place ship at '+ BoardUtilities.IntegerToColumn(x) +':'+ BoardUtilities.IntegerToRow(y));
					updated = true;
					cell.is = 'water';
					cell.complete = true;
					cell.ship = 0;
				}
			}
		}
		
		
		/* If we updated at least one field the method should check once
		 * more, perhaps now new fields are unreachable
		 */
		if (updated) {
			messages.push('At least one field changed, will search again');
			update_unreachable_fields();
		}
	};
	
	
	
	
	
	this.getNextTarget = function() {
		++count;
		
		
		/* Goes through the field and shots at next best looking cell
		 */
		var reference_targets = [BoardUtilities.getRandomElement(
			get_unknown_fields()
		)];
	
	
		/* Compares the reference propability with another field
		 * 
		 * @return +1 if field is better, -1 is weaker 0 if equal
		 */
		var compare_to_reference = function(field) {
			var reference = get(
				reference_targets[0].x,
				reference_targets[0].y
			);
		
			if (		!field.hasOwnProperty('ship')
				||	!field.hasOwnProperty('how_many_can_be_placed')) {
				
				throw 'Invalid field '+ JSON.stringify(field);
			}
			
			if (field.ship > reference.ship) {
				return +1;
			} else if (field.ship < reference.ship) {
				return -1;
			}
			
			if (field.how_many_can_be_placed > reference.how_many_can_be_placed) {
				return +1;
			} else if (field.how_many_can_be_placed < reference.how_many_can_be_placed) {
				return -1;
			}
			
			return 0;
		};
		
		
		for (var x = 0; x < width; ++x) {
			for (var y = 0; y < height; ++y) {
				var cell = field[x][y];
				
				if ('unknown' === cell.is) {
					var cmp = compare_to_reference(cell);
					
					/* If cell is better than create new
					 * reference
					 */
					if (cmp > 0) {
						reference_targets = [cell];
					
					/* If it is equally good, add to
					 * reference targets
					 */
					} else if (cmp === 0) {
						reference_targets.push(cell);
					}
				}
			}
		}
		
		/* Choose one target by random (reference_targets will contain
		 * at least one element)
		 */
		var result = BoardUtilities.getRandomElement(reference_targets);
		var cell = get(result.x, result.y);
		if ('unknown' !== cell.is) {
			throw 'Wanted to shoot at '+ JSON.stringify(cell) +' of '+ JSON.stringify(reference_targets);
		}
		messages.push('Will target '+ BoardUtilities.IntegerToColumn(result.x) +':'+ BoardUtilities.IntegerToRow(result.y));
		return result;
	};
	
	
	
	this.setResult = function(x, y, is) {
		
		if ((x < 0) || (x >= field.length) || (y < 0) || (y >= field[0].length)) {
			throw 'Invalid position '+ x +':'+ y;
		}
		var cell = field[x][y];
		
		
		/* No recalculation necessary if water
		 */
		if ('water' === is) {
			cell.is = 'water';
			cell.complete = true;
			cell.ship = 0;
		
		/* 
		 */
		} else if ('hit' === is) {
			cell.is = 'ship';
			cell.ship = 1;
			update_ship_propabilities(x, y);
			update_unreachable_fields();
			
		/* Wenn ship is sunk we can declare every field around it as
		 * water
		 */
		} else if ('sunk' === is) {
			cell.is = 'ship';
			cell.complete = true;	// @todo Alle angeschlossenen Felder auf complete setzen und Wahrscheinlichkeiten aktualisieren
			cell.ship = 1;
			mark_ship_complete(x, y);
			update_unreachable_fields();
			
		} else {
			throw new 'Invalid is `'+ is +'\'';
		}
	};
	
	
	
	this.getHtml = function() {
		var html = '<h1>Aggressive #'+ count +'</h1><table>';
		
		html += '<tr><td>&nbsp;</td>';
		for (var x = 0; x < width; ++x) {
			html += '<th>'+ BoardUtilities.IntegerToColumn(x) +'</th>';
		}
		html += '</tr>';
		
		for (var y = 0; y < height; ++y) {
			html += '<tr><th>'+ BoardUtilities.IntegerToRow(y) +'</th>';
			
			for (var x = 0; x < width; ++x) {
				var cell = field[x][y];
				html += '<td style="width: 50px; height: 50px; text-align: center; vertical-align: middle; background-color: '+ ('unknown' === cell.is ? 'gray' : ('ship' === cell.is ? 'red' : 'blue')) +'">'+ cell.ship +' ('+ cell.how_many_can_be_placed +')</td>';
			}
			html += '</tr>';
		}
		
		html += '</table>';
		
		if (0 !== messages.length) {
			html += '<ul>';
			
			for (var i = 0; i < messages.length; ++i) {
				html += '<li>'+ messages[i] +'</li>';
			}
			
			html += '</ul>';
		}
		messages = [];
		
		return html;
	};
};
