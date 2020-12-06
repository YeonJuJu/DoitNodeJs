//Calling up Crypto Module
var crypto = require('crypto');

var Schema = {};

//User Schema and Model Object Generation Function
Schema.createSchema = function(mongoose){

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

	return UserSchema;
}

module.exports = Schema;