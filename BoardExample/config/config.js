
/*
 * 설정
 */

module.exports = {
	server_port: 3000,
	db_url: 'mongodb://localhost:27017/local',
	db_schemas: [
	    {file:'./user_schema', collection:'users7', schemaName:'UserSchema', modelName:'UserModel'}
	    , {file:'./post_schema', collection:'posts7', schemaName:'PostSchema', modelName:'PostModel'}
	],
	route_info: [
		{file: './post', path: '/process/addpost', type: 'post', method: 'addPost'}
		, {file: './post', path: '/process/showpost/:id', type: 'get', method: 'showPost'}
		, {file: './post', path: '/process/listpost', type: 'get', method: 'listPost'}
		, {file: './post', path: '/process/listpost', type: 'post', method: 'listPost'}
	],
	facebook: {		// passport facebook
		clientID: '1150257705369153',
		clientSecret: '76281c2374a19b2fb704e848106cad19',
		callbackURL: 'http://localhost:3000/auth/facebook/callback',
		profileFields: ['id', 'email', 'name']
	},
	twitter: {		// passport twitter
		clientID: 'id',
		clientSecret: 'secret',
		callbackURL: '/auth/twitter/callback'
	},
	google: {		// passport google
		clientID: 'id',
		clientSecret: 'secret',
		callbackURL: '/auth/google/callback'
	}
}