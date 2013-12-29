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
var aggressive = require('./aggressive.js');
var defensive = require('./defensive.js');

var argv = require('optimist')
        .demand('server')
        .argv;









/**
 * Wartet auf den Gegner und fuehrt dann einen Zug aus
 */
var play = function(cb) {
	
	/* Wartet auf den Gegner
	 */
	var wait = function(cb) {
		console.log('Waiting for enemy...');
		
		request(argv.server +'/'+ state['game-id'] +'/wait/'+ state.token, function(error, response, body) {
			if (error) {
				cb(error);
				return;
			}
			body = JSON.parse(body);
			
			if ('you are next' === body.status) {
				cb(null);
			} else {
				cb(body.status +' ('+ body.reason +')');
			}
		});
	};
	
	
	/**
	 * Fuehrt den naechsten Schuss durch
	 */
	var draw = function(cb) {
		cb('fehler');
	};
	
	
	async.series([
		wait,
		draw
	], cb);
};





async.series([
	create_game,
	spawn_ships,
	
	function(cb) {
		async.forever(play, cb);
	}

], function(err, result) {
	console.log(err, result);
});
