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

//Using the Mongoose Module
var mongoose = require('mongoose');

//Declaring Variable for DB Object
var database;

//Declaring Variable for DB Schema Object
var UserSchema;

//Declaring Variable for DB Model Object
var UserModel;

//DB Connection
function connectDB(){
	//DB Connection Information
	var databaseUrl = 'mongodb://localhost:27017/local';

	//DB Connection
	console.log('Attempt to Connect DB ');
	mongoose.Promise = global.Promise;
	mongoose.connect(databaseUrl);
	database = mongoose.connection;

	database.on('error', console.error.bind(console, 'mongoose connection error.'));
	database.on('open', function(){
		console.log('DB Connected : ' + databaseUrl);

		//Schema and UserModel Definition
		createUserSchema();

	});

	//Reconnect after 5 seconds when disconnected
	database.on('disconnected', function(){
		console.log('Disconnected. Reconnect after  5 seconds.');
		setInterval(connectDB, 5000);
	});
}

var user = require('./routes/user');

function createUserSchema(){
	//Calling up user_schema.js module
	UserSchema = require('./database/user_schema').createSchema(mongoose);

	//UserModoel Model Definition
	UserModel = mongoose.model("users", UserSchema);
	console.log('UserModel Defined');

	user.init(database, UserSchema, UserModel);

}

//Router Object Reference
var router = express.Router();

//Login Routing Function - Compare to Database Information
router.route('/process/login').post(user.login);

//Add User Routing Function 
router.route('/process/adduser').post(user.adduser);

//Product Routing Function
router.route('/process/product').get(function (req, res) {
	console.log('/process/product called');

	if(req.session.user) //Already logged in
	{ 
		res.redirect('/public/product.html')
	}else { //Not logged in
		res.redirect('/public/login.html')

	}
})

//Logout Routing Function
router.route('/process/logout').get(user.logout);

//User List Routing Function
router.route('/process/listuser').post(user.listuser);

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

