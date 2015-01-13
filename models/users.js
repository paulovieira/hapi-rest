var Backbone = require("backbone-pg");

var UserM = Backbone.Model.extend({
/*
	defaults: {
		email: "",
		first: "",
		last: "",
	}
*/
});

var UsersC = Backbone.Collection.extend({
	model: UserM,
	connection: require("../dbSettings.js").getConnectionString("pg"),
});

module.exports = {
	model: UserM,
	collection: UsersC
};
