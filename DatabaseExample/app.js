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
		database = db.db('local');
	});
}

//User Authentication Function
var authUser = function(database, id, password, callback){
	console.log('authUser called');

	//User Collection Reference
	var users = database.collection('users');

	//Search using id and password
	users.find({"id" : id, "password" : password}).toArray(function(err, docs){
		if(err){
			callback(err, null);
			return;
		}

		if(docs.length > 0){
			console.log('ID : [%s], PW : [%s] Matching User Found', id, password);
			callback(docs);
		}else{
			console.log('No Matching User Found');
			callback(null);
		}
	});
}

//User Add Function
var addUser = function(database, id, password, name, callback){
	console.log('addUser called');
	
	//User Collection Reference
	var users = database.collection('users');

	//Add User using id, password, name
	users.insertOne({
		id : id,
		password : password,
		name : name
	}, function(err, result){
		if(err){
			callback(err, null);
			return;
		}

		console.log('User Record Added -> ' + id);
		callback(result);
	})	
}

//Router Object Reference
var router = express.Router();

//Login Routing Function - Compare to Database Information
router.route('/process/login').post(function(req, res){
	console.log('/process/login called');

	var paramId = req.body.id;
	var paramPassword = req.body.password;

	var callback = function(docs){
		if(docs){
			console.log('Login Success -> ' + docs[0].id);

			//Put Information in a Session
			req.session.user = {
				id : docs[0].id,
				name : docs[0].name
			}

			console.dir(req.session.user);

			//Go to the Product Inquert Page
			res.redirect('/public/product.html');
		}
		else{
			console.log('Login Fail');

			//Go to the Login Page
			res.redirect('/public/login.html');
		}
	}

	authUser(database, paramId, paramPassword, callback);
});

//Add User Routing Function 
router.route('/process/adduser').post(function (req, res){
	console.log('/process/adduser called');

	var paramId = req.body.id;
	var paramPassword = req.body.password;
	var paramName = req.body.name;

	console.log('Parameter -> ' + paramId + ' || ' + paramPassword + ' || ' + paramName);

	addUser(database, paramId, paramPassword, paramName, function(result){
		
		//Go to the Login Page
		res.redirect('/public/login.html');
	});
})

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
router.route('/process/logout').get(function (req, res) {
	console.log('/process/logout called');

	if (req.session.user) {
		req.session.destroy(function (err) {
			if(err) { throw err;}

			res.redirect('/public/login.html');
		})
	} else {
		res.redirect('/public/login.html');
	}
})

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

