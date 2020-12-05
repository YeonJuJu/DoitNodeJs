// 불러오기

// Express 기본 모듈 불러오기
var express = require('express');
var http = require('http');
var path = require('path');

// Express 미들웨어 불러오기
var bodyParser = require('body-parser');
var static = require('serve-static');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var expressErrorHandler = require('express-error-handler');

// 객체 생성
var app = express();
var router = express.Router();

// -----미들웨어 시작-----

// session, cookie app 객체에 등록
app.use(cookieParser());
app.use(expressSession({
	secret:'my key',
	resave:true,
	saveUninitialized:true	
}));

app.use(function(req, res, next){
	console.log('first middleware start');

	next();
})

// 폴더 열어주기 -> static
app.use('/public', static(path.join(__dirname, 'public')));

// body-parser 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false}));

// body-parser 이용해 application/json 파싱
app.use(bodyParser.json());

// 기본 포트를 app 객체에 속성으로 설정
app.set('port', process.env.PORT || 3000);



// -----라우팅 함수 코드 시작-----

//로그인 라우팅 함수
router.route('/process/login').post(function(req, res){
	console.log('/process/login ing');

	var paramId = req.body.id || req.query.id;
	var paramPassword = req.body.password || req.query.password;

	if(req.session.user){
		console.log('login ok');

		res.redirect('/public/product.html');
	}else{
		//session 저장
		req.session.user = {
			id: paramId,
			name: 'yeonju',
			authorized: true
		};

		res.writeHead('200', {'Content-Type' : 'text/html;charset=utf8'});
		res.write('<h1>로그인 성공</h1>');
		res.write('<div><p>Param Id : ' + paramId + '</p></div>');
		res.write('<div><p>Param password : ' + paramPassword + '</p></div>');
		res.write("<br><br><a href='/process/product'>상품 페이지로 이동하기</a>");
		res.end();
	}
})

//로그아웃 라우팅 함수
router.route('/process/logout').get(function(req, res){
	console.log('/process/logout 호출됨');

	if(req.session.user){
		console.log('logout ok');

		req.session.destroy(function(err){
			if(err){throw err;}

			console.log('delete session and logout');
			res.redirect('/public/login2.html');
		});
	}else{
		// No login status
		
		console.log('No Login man...');

		res.redirect('/public/login2.html');
	}
})

router.route('/process/product').get(function(req, res){
	console.log('/public/product 호출됨');

	if(req.session.user){
		res.redirect('/public/product.html');
	}
	else{
		res.redirect('/public/login2.html');
	}
});


// 미들웨어 등록

// 라우터 객체를 app 객체에 등록
app.use('/', router);
app.use(expressErrorHandler.httpError(404));
// 모든 라우터 처리 끝난 후 404 오류 페이지 처리
var errorHandler = expressErrorHandler({
	static: {
		'404' : './public/404.html'
	}
});
app.use(errorHandler);


// -----Express 서버 시작-----
http.createServer(app).listen(app.get('port'), function(){
	console.log('Express Server start : ' + app.get('port'));
});
