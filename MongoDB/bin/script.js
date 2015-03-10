var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/test");

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

db.once("open", function() {
	var userSchema = mongoose.Schema({
		alias: String
	});
	var User = mongoose.model("User", userSchema);
	var roflmao = new User({ alias: "roflmao" });
	roflmao.save();
});