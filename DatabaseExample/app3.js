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

//Calling up Crypto Module
var crypto = require('crypto');

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

//User Authentication Function
var authUser = function(database, id, password, callback){
	console.log('authUser called');

	UserModel.findById(id, function(err, results){
		if(results.length > 0){
			console.log('User Found');

			//Check password : authenticate()
			var user = new UserModel({id : id});
			var authenticated = user.authenticate(password, results[0]._doc.salt, results[0]._doc.hashed_password);

			console.log('here');

			if(authenticated){
				console.log('PW Matching');
				callback(results);
			}
			else{
				console.log('No PW Matching');
				callback(null);
			}
		}
	});

}

//User Add Function
var addUser = function(database, id, password, name, callback){
	console.log('addUser called');
	
	//Create an Instance for a UserModel
	var user = new UserModel({"id" : id, "password" : password, "name" : name});

	user.save(function(err){
		if(err){
			callback(err, null);
			return;
		}

		console.log('Add User Data');
		callback(null, user);
	})
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

//User Schema and Model Object Generation Function
function createUserSchema(){

	//Scheam Definition : password -> hashed_password, add default, salt attribute
	UserSchema = new mongoose.Schema({
		id: {type: String, required: true, unique: true, 'default': ' '},
		hashed_password: {type: String, required: true, 'default': ' '},
		salt: {type: String, required: true},
		name: {type: String, index: 'hashed', 'default': ' '},
		age: {type: Number, 'default': -1},
	    created_at: {type: Date, index: {unique: false}, 'default': Date.now},
	    updated_at: {type: Date, index: {unique: false}, 'default': Date.now}
	});

	//Define Info as virtual method
	UserSchema.virtual('password').set(function(password){
		this._password = password;
		this.salt = this.makeSalt();
		this.hashed_password = this.encryptPassword(password);
		console.log('Virtual Password called');
	})
	.get(function() {return this._password});

	//Add a method that can be used in the model instance to the schema
	//Password Encryption Method
	UserSchema.method('encryptPassword', function(plainText, inSalt) {
		if (inSalt) {
			return crypto.createHmac('sha1', inSalt).update(plainText).digest('hex');
		} else {
			return crypto.createHmac('sha1', this.salt).update(plainText).digest('hex');
		}
	});

	//Make Salt Method
	UserSchema.method('makeSalt', function() {
		return Math.round((new Date().valueOf() * Math.random())) + '';
	});

	//Authentication method - Compare to entered password (true/false return)
	UserSchema.method('authenticate', function(plainText, inSalt, hashed_password) {
		if (inSalt) {
			console.log('authenticate called : %s -> %s : %s', plainText, this.encryptPassword(plainText, inSalt), hashed_password);
			return this.encryptPassword(plainText, inSalt) === hashed_password;
		} else {
			console.log('authenticate called : %s -> %s : %s', plainText, this.encryptPassword(plainText), this.hashed_password);
			return this.encryptPassword(plainText) === this.hashed_password;
		}
	});
	// Function to verify that the value is valid
	var validatePresenceOf = function(value) {
		return value && value.length;
	};
		
	// Define the trigger function at save time (an error occurs when the password field is not valid)
	UserSchema.pre('save', function(next) {
		if (!this.isNew) return next();

		if (!validatePresenceOf(this.password)) {
			next(new Error('유효하지 않은 password 필드입니다.'));
		} else {
			next();
		}
	})
	
	// Validate required properties (Check length values)
	UserSchema.path('id').validate(function (id) {
		return id.length;
	}, 'id 칼럼의 값이 없습니다.');
	
	UserSchema.path('name').validate(function (name) {
		return name.length;
	}, 'name 칼럼의 값이 없습니다.');
	
	UserSchema.path('hashed_password').validate(function (hashed_password) {
		return hashed_password.length;
	}, 'hashed_password 칼럼의 값이 없습니다.');

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

