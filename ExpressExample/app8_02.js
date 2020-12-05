/* Express 기본 모듈 불러오기*/
var express = require('express');
var http = require('http');
var path = require('path');

// Express 미들웨어 불러오기
var bodyParser = require('body-parser');
var static = require('serve-static');

// Express 객체 생성
var app = express();
// 라우터 객체 참조
var router = express.Router();

// 기본 포트를 app 객체에 속성으로 설정
app.set('port', process.env.PORT || 3000);

// 라우팅 함수 등록
router.route('/process/login/:name').post(function(req, res){
	console.log('/process/login/:name ing');

	var paramName = req.params.name;

	var paramId = req.body.id || req.query.id;
	var paramPassword = req.body.password || req.query.password;

	res.writeHead('200', {'Content-Type' : 'text/html;charset=utf8'});
	res.write('<h1>Express 서버에서 응답한 결과입니다.</h1>');
	res.write('<div><p>Param Name : ' + paramName + '</p></div>');
	res.write('<div><p>Param Id : ' + paramId + '</p></div>');
	res.write('<div><p>Param password : ' + paramPassword + '</p></div>');
	res.write("<br><br><a href='/public/login3.html'>로그인 페이지로 돌아가기</a>");
	res.end();
})

// 미들웨어 등록

// body-parser 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false}));

// body-parser 이용해 application/json 파싱
app.use(bodyParser.json());

// static 이용해 public 폴더 연결
app.use('/public', static(path.join(__dirname, 'public')));

// 라우터 객체를 app 객체에 등록
app.use('/', router);

// 미들웨어에서 파라미터 확인
app.use(function(req, res, next){
	console.log('first middleware');

	var paramId = req.body.id || req.query.id;
	var paramPassword = req.body.password || req.query.password;

	res.writeHead('200', {'Content-Type' : 'text/html;charset=utf8'});
	res.write('<h1>Express 서버에서 응답한 결과입니다.</h1>');
	res.write('<div><p>Param Id : ' + paramId + '</p></div>');
	res.write('<div><p>Param password : ' + paramPassword + '</p></div>');
	res.end();
});

// Express 서버 시작
http.createServer(app).listen(app.get('port'), function(){
	console.log('Express Server start : ' + app.get('port'));
});
