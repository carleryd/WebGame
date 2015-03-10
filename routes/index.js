var express = require('express');
var router = express.Router();
var openid = require('openid');

// Framework for simplifying mongoosejs operations
var simpledb = require('mongoose-simpledb');
// Lazy loaded - might take a while!
var db = simpledb.init('mongodb://localhost/test');

var relyingParty = new openid.RelyingParty(
    'http://localhost:5000/login/verify', // Verification URL (yours)
    null, 	// Realm (optional, specifies realm for OpenID authentication)
    false, 	// Use stateless verification
    false, 	// Strict mode
    []  	// List of extensions to enable and include
);

// id is initialized to "1234" and when /login/verify is run without errors
// id is passed the final_id value which is the unique id from external account(gmail.com etc)
var id = "1234";
var final_id;

// Message codes(returned to front-end):
// 0 - Bad input
// 1 - User not found
// 2 - req-specific
// All checks that can be done on incorrect input are done on client side

// Get from database, send to client-side
router.get('/', function(req, res) { // req from browser
	res.render('index', {
		title: "Motocross game",
		myID: id
	});
});

router.get('/login', function(req, res) { // req from browser
	res.render('login', {
		title: "OpenID authentication"
	});
});

router.get('/login/authenticate', function(req, res) {
	var identifier = req.query.openid_identifier;

	// Resolve identifier, associate, and build authentication URL
	relyingParty.authenticate(identifier, false, function(error, authUrl) {
		if (error) {
			res.writeHead(200);
			res.end('Authentication failed: ' + error.message);
		}
		else if (!authUrl) {
			res.writeHead(200);
			res.end('Authentication failed');
		}
		else {
			res.writeHead(302, { Location: authUrl });
			res.end();
		}
	});
});

router.get('/login/verify', function(req, res) {
	relyingParty.verifyAssertion(req, function(error, result) {
		if(!error && result.authenticated) {

			var url = result.claimedIdentifier;
			var id_check = /[?&]id=([^&]+)/i;
			var match = id_check.exec(url);

			if (match != null)	final_id = match[1];
			else 				final_id = "";

			db.User.findOne( { "id": final_id }, function(err, user) {
				if(!user) {
					var newUser = db.User({
						id: final_id,
						alias: ("newUser-" + final_id[0] + final_id[1] + final_id[2]),
						levels: [
			                { number: 1, time: 999, rating: 999, comments: [] },
			                { number: 2, time: 999, rating: 999, comments: [] },
			                { number: 3, time: 999, rating: 999, comments: [] },
			                { number: 4, time: 999, rating: 999, comments: [] },
			                { number: 5, time: 999, rating: 999, comments: [] },
			                { number: 6, time: 999, rating: 999, comments: [] },
			                { number: 7, time: 999, rating: 999, comments: [] }
		              	]
					});
					newUser.save(function(e) {
						console.log("User stored: " + req.body);
					});
				}
				else console.log("User already stored");
			});

			// When id is given final_id, angular will be given myID(== final_id)
			id = final_id;
			res.redirect('/');
		}
		else {
			console.log("error storing new user");
			res.render('login', { title: "Error logging in" })
		}
	});
});

router.get('/getUsers', function(req, res) {
	db.User.find({}, function(err, users) {
		var userMap = {};

		users.forEach(function(user) {
			userMap[user._id] = user;
		});
		res.send(userMap);
	});
});

router.post('/postAlias', function(req, res) {
	db.User.findOne( { "id": req.param("id") }, function(err, id_user) {
		if(err) return console.error(err);
		if(id_user) {
			db.User.findOne( { "alias": req.param("alias") }, function(err, alias_user) {
				if(err) return console.error(err);
				if(alias_user) {
					console.log("YES");
					console.log(id_user.alias);
					res.send("2");
				}
				// alias not taken
				else {
					id_user.alias = req.param("alias");
					id_user.save();
					res.send(id_user.alias);
				}
			});
		}
	});
});

router.post('/postUser', function(req, res) {
	db.User.findOne( { "alias": req.param("alias") }, function(err, user) {
		if(err) return console.error(err);
		if(user) {
			console.log("user exists");
			res.send("2");
		}
		else {
			var newUser = db.User({
				alias: req.param("alias"),
				levels: [
	                { number: 1, time: 999, rating: 999, comments: [] },
	                { number: 2, time: 999, rating: 999, comments: [] },
	                { number: 3, time: 999, rating: 999, comments: [] },
	                { number: 4, time: 999, rating: 999, comments: [] },
	                { number: 5, time: 999, rating: 999, comments: [] },
	                { number: 6, time: 999, rating: 999, comments: [] },
	                { number: 7, time: 999, rating: 999, comments: [] }
              	]
			});
			newUser.save(function(e) {
				console.log("User stored: " + req.body);
				res.send(req.body);
			});
		}
	});
});

router.post('/postTime', function(req, res) {
	// alias and time recieved correctly
	db.User.findOne( { "alias": req.param("alias") }, function(err, user) {
		if(err) return console.error(err);
		if(user) {
			if(user.levels[parseInt(req.param("level"))-1].time > 
				parseFloat(req.param("time"))) {
				
				user.levels[parseInt(req.param("level"))-1].time =
					parseFloat(req.param("time"));
				user.save();
				res.send(req.body);
			}
			else {
				console.log("faster time registered");
				res.send("2");
			}
		}
		else {
			console.log("user not found");
			res.send("1");
		}
	});
});

router.post('/postRating', function(req, res) {
	db.User.findOne( { "alias": req.param("alias") }, function(err, user) {
		if(err) return console.error(err);
		if(user) {
			user.levels[parseInt(req.param("level"))-1]
				.rating = parseInt(req.param("rating"));
			user.save();
			res.send(req.body);
		}
		else {
			console.log("user not found");
			res.send("1");
		}
	});
});

router.post('/postComment', function(req, res) {
	db.User.findOne( { "alias": req.param("alias") }, function(err, user) {
		if(err) return console.error(err);
		if(user) {
			user.levels[parseInt(req.param("level"))-1].comments.push({
				"text": req.param("text"),
				"date": req.param("date")
			});
			user.save();
			res.send(req.body);
		}
		else {
			console.log("user not found");
			res.send("1");
		}
	});
});

module.exports = router;