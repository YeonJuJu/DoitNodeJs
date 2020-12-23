/**
 * 글쓰기 관련 데이터베이스 스키마를 정의하는 모듈
 *
 * @date 2020-12-12
 * @author JuJu
 */

var Schema = {};

Schema.createSchema = function(mongoose) {
	
	// 스키마 정의
	var PostSchema = mongoose.Schema({
		title: {type: String, required: true, trim: true}
		, contents: {type: String, required: true, trim: true}
		, writer: {type: mongoose.Schema.ObjectId, ref:'users7'}
	    , created_at: {type: Date, index: {unique: false}, 'default': Date.now}
	    , updated_at: {type: Date, index: {unique: false}, 'default': Date.now}
	    , comments: [{
	    	contents: {type: String, required: true, trim: true}
	    	, created_at: {type: Date, index: {unique: false}, 'default': Date.now}
	    	, writer: {type: mongoose.Schema.ObjectId, ref:'users7'}
	    }]
	    , read_count: {type:Number, default: 0}
	});

	//static 정의
	PostSchema.statics = {
		loadPost: function (oid, callback){
			//this.findById(oid, callback);
			this.findByIdAndUpdate(oid, {$inc: {read_count:1}}).populate('writer', 'name email')
			.populate({path:'comments.writer', select: 'name email'}).exec(callback);
		}
		, findAll: function (callback){
			//this.find({}, callback);
			this.find({}).populate('writer', 'name email').exec(callback);
		}
		, addComment: function(oid, paramContents, writerOID, callback){
			this.findByIdAndUpdate(oid, {'$push': {'comments':{'contents':paramContents, 'writer':writerOID}}},
            	{'new': true, 'upsert': true}).populate('writer', 'email name').populate('comments.writer').exec(callback);
		} 
	}

	//validate
	PostSchema.path('title').required(true, '제목을 입력해주세요');
	PostSchema.path('contents').required(true, '내용을 입력해주세요');

	//method 정의
	PostSchema.methods = {
		savePost: function(callback){
			var self = this;

			this.validate(function(err){
				if(err) return callback(err, null);

				self.save(callback);
			});
		},
		addComment: function(user, comment, callback) {		// 댓글 추가
			this.comment.push({
				contents: comment.contents,
				writer: user._id
			});
			
			this.save(callback);
		}
	}

	
	// 값이 유효한지 확인하는 함수 정의
	var validatePresenceOf = function(value) {
		return value && value.length;
	};

	console.log('PostSchema 정의함.');

	return PostSchema;
};

// module.exports에 UserSchema 객체 직접 할당
module.exports = Schema;

