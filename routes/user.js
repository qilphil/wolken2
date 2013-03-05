/*
 * GET home page.
 */
var dbstuff = require("../dbstuff");


exports.requireAuthentication = function(req, res) {

}
exports.loadUser = function(req, res) {

}
exports.register = function(req, res) {
	res.render('register', {
		title: 'Anmelden'
	});
};
exports.login = function(req, res) {
	res.render('login', {
		title: 'Einloggen'
	});
};
exports.index = function(req, res) {
	dbstuff.getUsers(function(err, results) {
		res.render('users', {
			title: 'UserAdmin',
			body: results.Message
		});
	});
};