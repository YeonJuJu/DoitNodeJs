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


//Router Object Reference
var router = express.Router();

router.route('/smu/apply').get(function(req, res){
	res.redirect('/public/apply1.html');
});

//Login Routing Function - Compare to Database Information
router.route('/smu/apply1').post(function(req, res){
	console.log('/smu/apply1 호출됨');

	var paramName = req.body.name;
	var paramMajor = req.body.major;
	var paramStudentNum = req.body.studentNum;

	//Put Information in a Session
			req.session.user = {
				name : paramName,
				major : paramMajor,
				studentNum : paramStudentNum,
				motive : '',
				department : ''
			}

			console.dir(req.session.user);

			//Go to the Product Inquert Page
			res.redirect('/public/apply2.html');

});

router.route('/smu/apply2').post(function(req, res){
	console.log('/smu/apply2 호출됨');

	var paramMotive = req.body.motive;
	var paramDepartment = req.body.department;

	//console.dir(paramMotive + paramDepartment);

	//Put Information in a Session
	req.session.user = {
		name : req.session.user.name,
		major : req.session.user.major,
		studentNum : req.session.user.studentNum,
		motive : paramMotive,
		department : paramDepartment,		
	}

	console.dir(req.session.user);

	//Go to the Product Inquert Page
	res.redirect('/public/apply3.html');

});

router.route('/smu/apply3').post(function(req, res){
	console.log('/smu/apply3 호출됨');

	console.log(req.session.user);

	res.writeHead(200, {'Content-Type':'text/html;charset=utf8'});
	//res.write('<div><p>메모가 저장되었습니다.</p></div>');
	res.write('<div><p>' + req.session.user.name + '</p></div>');
	res.write('<div><p>' + req.session.user.major + '</p></div>');
	res.write('<div><p>' + req.session.user.studentNum + '</p></div>');
	res.write('<div><p>' + req.session.user.motive + '</p></div>');
	res.write('<div><p>' + req.session.user.department + '</p></div>');
    res.end();
    return;

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

