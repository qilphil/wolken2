/*
 * GET users listing.
 */
var dbstuff = require("../dbstuff"),
    filestuff = require("../filestuff");

var userstuff = require("../userstuff");
exports.do_login = function(req, res) {
    var val = {

        fail: function(msg, field) {
            this.returnMsg(msg, field, true, "login_fail", '');
        },
        notEmpty: function(field, name) {
            if (inData[field] == "") {
                this.fail(name + " darf nicht leer sein", field);
            };
            return !(inData[field] == "");
        },
        returnMsg: function(Message, field, Error, status, id) {
            res.send(JSON.stringify({
                Message: Message,
                Field: field,
                Error: Error,
                status: status,
                id: id
            }));
        }
    };
    try {
        var inData = req.body;

        if (!inData) {
            val.fail("No Data Received", "name",true,"login_fail",'');
        } else {

            if (val.notEmpty("password", "Passwort") && val.notEmpty("name", "Username")) {

                dbstuff.findUser({
                    name: inData.name
                }, function(userData) {
                    console.log("login_findUser", userData);
                    if (userData.length > 0) {
                        var localUser = userData[0];
                        var password = userstuff.mkPassword(inData.password, localUser.salt);
                        if (password === localUser.password) {
                            var sessionData = {
                                name: inData.name,
                                user_id: localUser._id,
                                created: new Date(),
                                lastaccess: new Date(),

                            };
                            dbstuff.saveSession(sessionData, function(savedSession) {
                                req.session.session_id = savedSession._id
                                val.returnMsg("Benutzer " + savedSession.name + " eingeloggt", "", false, "login_success", savedSession._id);
                            })
                        } else {
                            val.returnMsg("Benutzer " + userData[0].name + " kann nicht authentifiziert werden", "name", true, "login_fail", userData._id);
                        }
                    } else {
                        val.returnMsg("Benutzer " + inData.name + " kann nicht gefunden werden", "name", true, "login_fail", userData._id);
                    }
                });
            }
        }
    } catch (exError) {
        console.log(exError);
        val.returnMsg("error:" + exError.toString(), "", true, "signup_fail", '');
    }
};
exports.save_signup = function(req, res) {
    var val = {
        fail: function(msg, field) {
            this.returnMsg(msg, field, true, "signup_fail", '');
        },

        notEmpty: function(field, name) {
            if (inData[field] == "") {
                this.fail(name + " darf nicht leer sein", field);
            };
            return !(inData[field] == "");
        },

        returnMsg: function(Message, field, Error, status, id) {
            res.send(JSON.stringify({
                Message: Message,
                Field: field,
                Error: Error,
                status: status,
                id: id
            }));
        }
    };
    try {
        var inData = req.body;

        if (!inData) {
            valfail("No Data Received", "");
        } else {

            if (val.notEmpty("password", "Passwort") && val.notEmpty("password2", "Passwortbestätigung") && val.notEmpty("email", "Email") && val.notEmpty("name", "Username")) {
                if (inData.password !== inData.password2) {
                    val.fail("Passwörter stimmen nicht überein", "password2");
                } else {

                    dbstuff.findUser({
                        name: inData.name
                    }, function(userData) {
                        console.log("su_findUser", userData);
                        if (userData.length == 0) {
                            var passSalt = userstuff.mkPassSalt(inData.password);
                            var saveData = {
                                name: inData.name,
                                password: passSalt.pass,
                                salt: passSalt.salt,
                                email: inData.email.toLowerCase()
                            };
                            dbstuff.saveSignup(saveData, function(savedData) {
                                val.returnMsg("Benutzer " + savedData.name + " angelegt", "", false, "signup_success", savedData._id);
                            })
                        } else {
                            val.returnMsg("Benutzer " + userData[0].name + " existiert bereits", "name", true, "signup_fail", userData._id);
                        }
                    });
                }
            }
        }
    } catch (exError) {
        console.log(exError);
        val.returnMsg("error:" + exError.toString(), "", true, "signup_fail", '');
    }
};