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
var Configuration = require('./../common/Configuration.js');

var Client = require('./Client.js');

var Aggressive = require('./Aggressive.js');
var Defensive = require('./RandomDefensive.js');

var argv = require('optimist')
	.demand('server').describe('server', 'Server URL including schema')
//	.default('width', 10).describe('width', 'Width of board')
//	.default('height', 10).describe('height', 'Height of board')
	.default('clients', 2).describe('clients', 'Number of clients to create')
.argv;



/* Initialize client
 */
var configuration = new Configuration();
var clients = [];

for (var i = 0; i < argv.clients; ++i) {
	var dimension = configuration.getDimension();
	var ships = configuration.getShips();
	
	clients.push(new Client(
		argv.server,
		new Aggressive(dimension.width, dimension.height),
		new Defensive(ships, dimension.width, dimension.height)
	));
}


/* Start one client after another
 */
var start_next = function() {
	
	if (0 === clients.length) {
		console.log('All clients started');
		return;
	}
	var client = clients.pop();
	
	client(function(error, result) {
		if (error) {
			console.error('Game aborted due to an error', error);
		} else {
			console.log('Game finished successfully', result);
		}
	}, start_next);
};
start_next();



/* Wait until game finished
 */
console.log('Waiting for clients to finish...');
