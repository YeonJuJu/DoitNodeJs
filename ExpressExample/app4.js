/* Express 기본 모듈 불러오기*/
var express = require('express');
var http = require('http');

// Express 객체 생성
var app = express();

// 기본 포트를 app 객체에 속성으로 설정
app.set('port', process.env.PORT || 3000);

// 미들웨어 등록

// 첫번째 미들웨어
app.use(function(req, res, next){
	console.log('first middleware');

	res.send({name: 'BTS', members: 'V'});
});

// Express 서버 시작
http.createServer(app).listen(app.get('port'), function(){
	console.log('Express Server start : ' + app.get('port'));
});
