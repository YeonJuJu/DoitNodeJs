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

		//Schema Definition
		UserSchema = new mongoose.Schema({
			id: {type: String, required: true, unique: true},
			password: {type: String, required: true},
			name: {type: String}
		});
		console.log('Schema Defined');

		//Schema Method Definition
		UserSchema.static('findById', function(id, callback){
			return this.find({'id': id}, callback);
		})

		UserSchema.static('findAll', function(callback){
			return this.find({}, callback);
		})

		//UserModoel Model Definition
		UserModel = mongoose.model("users", UserSchema);
		console.log('UserModel Defined');
	});

	//Reconnect after 5 seconds when disconnected
	database.on('disconnected', function(){
		console.log('Disconnected. Reconnect after  5 seconds.');
		setInterval(connectDB, 5000);
	});
}

//User Authentication Function
var authUser = function(database, id, password, callback){
	console.log('authUser called');

	//Search using id and password
	// UserModel.find({"id" : id, "password" : password}, function(err, results){
	// 	if(err){
	// 		callback(err, null);
	// 		return;
	// 	}

	// 	console.dir(results);

	// 	if(results.length > 0){
	// 		console.log('User Found -> id : ' + id + " || pw : " + password);
	// 		callback(null, result);
	// 	}
	// 	else{
	// 		console.log('User Not Found');
	// 		callback(null, null);
	// 	}
	// })
	UserModel.findById(id, function(err, result){
		if(result[0]._doc.password == password){
			callback(err, result);
		}
		else{
			callback(err, null);
		}
	});

}

//User Add Function
var addUser = function(database, id, password, name, callback){
	console.log('addUser called');
	
	//Create an Instance for a UserModel
	var user = new UserModel({"id" : id, "password" : password, "name" : name});

	//Save
	user.save(function(err, result){
		if(err){
			callback(err, null);
			return;
		}
		else{
			console.dir(result);
			callback(err, result);
		}
	});
};

//User List Function
var listUser = function(database, callback){

	UserModel.findAll(function(err, results){
		if(err || results.length == 0){
			callback(err, null);
		}
		else{
			callback(err, results);
		}
	});
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

//User List Routing Function
router.route('/process/listuser').post(function(req, res){
	console.log('/process/listuser called');

	listUser(database, function(err, results){
		if(err || results.length == 0){
			console.dir('No User List');

			res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
			res.write('<h2>사용자 리스트 조회 중 오류 발생</h2>');
			res.end();
			return;
		}
		else{
			console.dir(results);

			res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
			res.write('<h2>사용자 리스트</h2>');
			res.write('<div><ul>');
			for(var i = 0 ; i < results.length ; i++){
				res.write('<li> #' + (i+1) + ' id : ' + results[i]._doc.id + ', name : ' + results[i]._doc.name + '</li>');
			}
			res.write('</div></ul>');
			res.end();
		}
	})
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

