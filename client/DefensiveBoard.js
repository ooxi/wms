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
var Board = require('./../common/Board.js');
var BoardUtilities = require('./../common/BoardUtilities.js');





module.exports = function(expected_ships, width, height) {

	var UNKNOWN = 'unbekannt';
	var SHIP = 'Schiff';
	var WATER = 'Wasser';
	
	
	
	var board = new Board(expected_ships, width, height, function(cell) {
		cell.shot = false;
		return cell;
	});
	
	
	
	
	
	board.getFlat = function() {
		var flat = [];
		
		for (var x = 0; x < width; ++x) {
			for (var y = 0; y < height; ++y) {
				var cell = board.getByPosition(x, y);
				var content = UNKNOWN;
				
				if (board.isShip(cell)) {
					content = SHIP;
				} else if (board.isWater(cell)) {
					content = WATER;
				}
				
				flat.push({
					x:		cell.column,
					y:		cell.row,
					enthaelt:	content,
					beschossen:	cell.shot
				});
			}
		}
		
		return flat;
	};
	
	
	
	board.setEnemyShot = function(x, y) {
		var cell = board.getByPosition(x, y);
		cell.shot = true;
	};
	
	
	
	board.getHtml = function() {
		var html = '<h1>Defensive</h1><table>';
		
		html += '<tr><td>&nbsp;</td>';
		for (var x = 0; x < width; ++x) {
			html += '<th>'+ BoardUtilities.IntegerToColumn(x) +'</th>';
		}
		html += '</tr>';
		
		/* @return Cell color depending on type
		 */
		var getColor = function(cell) {
			
			if ('unknown' === cell.type) {
				return 'gray';
			} else if ('ship' === cell.type) {
				return 'red';
			} else if ('water' === cell.type) {
				return 'blue';
			}
			throw 'Invalid cell type `'+ cell.type +'\'';
		};
		
		for (var y = 0; y < height; ++y) {
			html += '<tr><th>'+ BoardUtilities.IntegerToRow(y) +'</th>';
			
			for (var x = 0; x < width; ++x) {
				var cell = this.getByPosition(x, y);
				var color = getColor(cell);
				html += '<td style="width: 50px; height: 50px; text-align: center; vertical-align: middle; color: white; font-size: 20px; background-color: '+ getColor(cell) +'">'+ (cell.shot ? '&times;' :'&nbsp;') +'</td>';
			}
			html += '</tr>';
		}
		
		html += '</table>';
		return html;
	};
	
	
	
	
	
	return board;
};
