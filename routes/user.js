/*
 * GET home page.
 */
var dbstuff = require("../dbstuff");

exports.requireAuthentication = function(req, res, next) {
    if (!req.currentUser) {
        res.redirect("/login");
    }
    else
        next();
};
exports.loadUser = function(req, res, next) {
    if (req.session.session_id) {
        dbstuff.findSession(req.session.session_id, function(sessionData) {
            if (sessionData) {
                dbstuff.findUser({
                    name: sessionData.name
                }, function(userData) {
                    if (userData.length > 0) {
                        req.currentUser = userData[0];
                        res.locals.user = userData[0];
                        next();
                    }
                });
            }
        });
    } else {
        next();
    }
};
exports.register = function(req, res) {
    res.render('register', {
        title: 'Anmelden'
    });
};
exports.login = function(req, res) {
    if (!req.session.logintry) {
        req.session.logintry = 1;
    } else {
        req.session.logintry++;
    }
    ;
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
exports.signout = function(req, res) {
    delete req.session.session_id;
    res.redirect("/");
};