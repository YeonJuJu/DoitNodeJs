/* Express 기본 모듈 불러오기*/
var express = require('express');
var http = require('http');
var path = require('path');

// Express 미들웨어 불러오기
var bodyParser = require('body-parser');
var static = require('serve-static');

// Express 객체 생성
var app = express();

// 기본 포트를 app 객체에 속성으로 설정
app.set('port', process.env.PORT || 3000);

// 미들웨어 등록

// body-parser 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false}));

// body-parser 이용해 application/json 파싱
app.use(bodyParser.json());

// static 이용해 public 폴더 연결
app.use('/public', static(path.join(__dirname, 'public')));

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
