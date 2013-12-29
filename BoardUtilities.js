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
module.exports = {
	
	ColumnToInteger: function(column) {
		column = column.toUpperCase();
		
		switch (column) {
			case 'A':	return 0;
			case 'B':	return 1;
			case 'C':	return 2;
			case 'D':	return 3;
			case 'E':	return 4;
			case 'F':	return 5;
			case 'G':	return 6;
			case 'H':	return 7;
			case 'I':	return 8;
			case 'J':	return 9;
		}
		throw 'Unkown column `'+ column +'\'';
	},



	/**
	 * @author Graham
	 * @see http://stackoverflow.com/a/182924
	 */
	IntegerToColumn: function(i) {
		var dividend = i + 1;
		var column = '';
		
		while (dividend > 0) {
			var modulo = (dividend - 1) % 26;
			column = String.fromCharCode(65 + modulo) + column;
			dividend = parseInt((dividend - modulo) / 26);
		}

		return column;
	},
	
	
	
	RowToInteger: function(row) {
		return row - 1;
	},
	
	
	
	IntegerToRow: function(i) {
		return i + 1;
	},
	
	
	
	getRandomElement: function(array) {
		return array[Math.floor(Math.random() * array.length)];
	}
};
