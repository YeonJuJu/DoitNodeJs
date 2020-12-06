//Using the Mongoose Module
var mongoose = require('mongoose');

var database = {};

database.init = function(app, config){
	console.log('init function called');

	connect(app, config);
}

function connect(app, config){
	console.log('connect function called');

	// DB Connection : config
    mongoose.Promise = global.Promise;
	mongoose.connect(config.db_url);
	database.db = mongoose.connection;
	
	database.db.on('error', console.error.bind(console, 'mongoose connection error.'));	
	database.db.on('open', function () {
		console.log('DB Connected : ' + config.db_url);
		
		createSchema(app, config);
		
	});
	database.db.on('disconnected', connect);

}

//Create Schema and Model using config
function createSchema(app, config){
	var schemaLen = config.db_schemas.length;
	console.log('Number of schemas defined in Setup : %d', schemaLen);

	for(var i=0; i<schemaLen; i++){
		var curItem = config.db_schemas[i];

		var curSchema = require(curItem.file).createSchema(mongoose);
		console.log('%s Define the schema after importing the module', curItem.file);

		var curModel = mongoose.model(curItem.collection, curSchema);
		console.log('%s Define model for collection', curItem.collection);

		database[curItem.schemaName] = curSchema;
		database[curItem.modelName] = curModel;
		console.log('Schema Name : %s, Model Name : %s', curItem.schemaName, curItem.modelName);
	}

	app.set('database', database);
	console.log('Database object added as property of app object');
}

module.exports = database;