var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/test");

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

db.once("open", function() {
	var userSchema = mongoose.Schema({
		alias: String,
		levels: [{
			number: Number,
			time: Number
		}]
	});

	var User = mongoose.model("User", userSchema);
});