//Calling up Express module
var express = require('express');
var http = require('http');
var path = require('path');

//Calling up Express's Middleware
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var static = require('serve-static');
var errorHandler = require('errorhandler');

//Using the ErrorHandler Module
var expressErrorHandler = require('express-error-handler');

//Calling up Session Middleware
var expressSession = require('express-session');

//Create Express Object
var app = express();

//Default Property Setting
app.set('port', process.env.PORT || 3000);

//Parse application/x-www-form-urlendoed using body-parser
app.use(bodyParser.urlencoded({ extended: false}));

//Parse application/json using body-parser
app.use(bodyParser.json());

//Open Public Folder using static
app.use('/public', static(path.join(__dirname, 'public')));

//cookie-parser Setting
app.use(cookieParser());

//Session Setting
app.use(expressSession({
	secret: 'my key',
	resave: true,
	saveUninitialized: true
}));

//Using the MongoDB Module
var MongoClient = require('mongodb').MongoClient;

//Declaring Variable for DB Object
var database;

//DB Connection
function connectDB(){
	//DB Connection Information
	var databaseUrl = 'mongodb://localhost:27017/local';

	//DB Connection
	MongoClient.connect(databaseUrl, function(err, db){
		if(err) throw err;

		console.log('DB connected : ' + databaseUrl);

		//Assign to Variable
		database = db;
	});
}

//Router Object Reference
var router = express.Router();

//Login Routing Function- Compare to Database Information
router.route('/process/login').post(function(req, res){
	condole.log('/process/login called');


});

//Register Router Object
app.use('/', router);

//===== 404 Error Page Processing =====//
var errorHandler = expressErrorHandler({
	static: {
		'404' : './public/404.html'
	}
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

//===== Server Start =====//
http.createServer(app).listen(app.get('port'), function(){
	console.log('Server Start at port -> ' + app.get('port'));

	//Connect DB
	connectDB();
});

