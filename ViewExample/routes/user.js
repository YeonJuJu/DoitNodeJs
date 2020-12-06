// var database;
// var UserSchema;
// var UserModel;

// var init = function(db, schema, model){
// 	console.log('init called');

// 	database = db;
// 	UserSchema = schema;
// 	UserModel = model;
// }

//User Authentication Function
var authUser = function(database, id, password, callback){
	console.log('authUser called');

	var UserModel = database.UserModel;

	UserModel.findById(id, function(err, results){
		if(results.length > 0){
			console.log('User Found');

			//Check password : authenticate()
			var user = new UserModel({id : id});
			var authenticated = user.authenticate(password, results[0]._doc.salt, results[0]._doc.hashed_password);

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
	var user = new database.UserModel({"id" : id, "password" : password, "name" : name});

	user.save(function(err){
		if(err){
			callback(err, null);
			return;
		}

		console.log('Add User Data');
		callback(user);
	})
};

//User List Function
var listUser = function(database, callback){

	var UserModel = database.UserModel;

	UserModel.findAll(function(err, results){
		if(err || results.length == 0){
			callback(err, null);
		}
		else{
			callback(err, results);
		}
	});
}

var login = function(req, res){
	console.log('/process/login called');

	var paramId = req.body.id;
	var paramPassword = req.body.password;

	var database = req.app.get('database');

	res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});

	var callback = function(docs){
		if(docs){
			console.log('Login Success -> ' + docs[0].id);

			//Put Information in a Session
			req.session.user = {
				id : docs[0].id,
				name : docs[0].name
			}

			console.dir(req.session.user);

			var context = {userid: paramId, username: docs[0].name};
			req.app.render('login_success', context, function(err, html){

				if(err){
					console.log('Error (View Rendering) : ' + err.stack);

					res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
					res.write('<h2>뷰 렌더링 중 오류 발생</h2>');
					res.write('<p>' + err.stack + '</p>');
					res.end();

					return;
				}

				res.end(html);
			});
		}
		else{
			console.log('Login Fail');

			//Go to the Login Page
			res.redirect('/public/login.html');
		}
	}

	authUser(database, paramId, paramPassword, callback);
}

var adduser = function (req, res){
	console.log('/process/adduser called');

	var paramId = req.body.id;
	var paramPassword = req.body.password;
	var paramName = req.body.name;

	var database = req.app.get('database');

	console.log('Parameter -> ' + paramId + ' || ' + paramPassword + ' || ' + paramName);

	res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});

	addUser(database, paramId, paramPassword, paramName, function(result){
		
		var context = {'title' : '사용자 추가 성공'};
		req.app.render('adduser', context, function(err ,html){
			if(err){
				console.log('Error (View Rendering) : ' + err.stack);

				res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
				res.write('<h2>뷰 렌더링 중 오류 발생</h2>');
				res.write('<p>' + err.stack + '</p>');
				res.end();

				return;
			}

			res.end(html);
		});

	});
}

var listuser = function(req, res){
	console.log('/process/listuser called');

	var database = req.app.get('database');

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

			var context = {results: results};
			req.app.render('listuser', context, function(err, html){
				if(err){throw err;}

				res.end(html);
			});
		}
	})
}

var logout = function (req, res) {
	console.log('/process/logout called');

	var database = req.app.get('database');

	if (req.session.user) {
		req.session.destroy(function (err) {
			if(err) { throw err;}

			res.redirect('/public/login.html');
		})
	} else {
		res.redirect('/public/login.html');
	}
}

var product = function(req, res){
	console.log('/process/product called');

	if(req.session.user) //Already logged in
	{ 
		res.redirect('/public/product.html')
	}else { //Not logged in
		res.redirect('/public/login.html')

	}
}

//module.exports.init = init;
module.exports.login = login;
module.exports.logout = logout;
module.exports.adduser = adduser;
module.exports.listuser = listuser;
module.exports.product = product;