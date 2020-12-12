/****
 * 게시판 관련 라우팅 모듈
 *
 **/

var entities = require('html-entities').AllHtmlEntities;

var addPost = function(req, res){
	console.log('addPost called');

	var paramTitle = req.body.title;
	var paramContents = req.body.contents;
	var paramWriter = req.body.writer || req.user.email;

	var database = req.app.get('database');

	//writer's object id 찾기
	database.UserModel.findByEmail(paramWriter, function(err, results){
		if(err){
			console.dir(err);
			return;
		}

		if(results.length < 1){ //query 결과가 비어있을 때
			 res.send('해당 이메일은 등록되어 있지 않습니다.');
			 return;
		}

		var writerOID = results[0]._doc._id;
		console.log('사용자 정보 조회됨');
		console.dir(results[0]._doc._id);

		var post = new database.PostModel({
			title: paramTitle,
			contents: paramContents,
			writer: writerOID
		});

		post.savePost(function(err, result){
			if(err){
				console.dir(err);
				res.send('저장 실패');
				return;
			}
		});

		res.redirect('/process/showpost/' + post._id);
	});
}

var showPost = function(req, res){
	console.log('showPost called');

	var paramId = req.params.id;

	var database = req.app.get('database');

	if(database){
		database.PostModel.loadPost(paramId, function(err, result){
			console.dir(result); //글 정보

			var context = {
				title: '글 읽기',
				posts: result,
				Entities: entities
			}
			res.render('showpost', context, function(err, html){
				res.end(html);
			});
		});
	} else {
		res.send('db connection lost');
	}
}

var listPost = function(req, res){
	console.log('listPost called');

	var database = req.app.get('database');

	if(database){
		database.PostModel.findAll(function(err, docs){
			if(err){
				console.dir(err);
				res.send(err);
				return;
			}

			if(docs.length<1){
				res.send('글이 없습니다.');
				return;
			}

			var context = {
				title: '글 목록'
				, posts: docs
			}

			req.app.render('listpost', context, function(err, html){
				if(err){
					console.dir(err);
					return;
				}
				res.end(html);
			});
		});
	}
}


module.exports.addPost = addPost;
module.exports.showPost = showPost;
module.exports.listPost = listPost;