(function(exports){
	'use strict';
	var   config = exports.config.websql
		, api = {}
		, db = {}
		; 
	exports.storage = $.extend({}, api);
	
	
	if (!config) return false;
	db = new Snake(config.config, config.tables, config.pre_sql);
	if (db){
		Object.keys(db).forEach(function(item){
			exports.storage[item] = db[item];
		})
		exports.storage.db = db;
	}
	exports.storage.clear = function(){
		localStorage.clear();
		exports.storage.db.SQL('DROP table bills');
		exports.storage.db.SQL('DROP table operators');
		exports.storage.db.SQL('DROP table rooms');
		console.log('Drop all tables');
	}
	console.log('initialize db finished');
	
})(App);