/*
 * GET users listing.
 */
var dbstuff = require("../dbstuff"),
        filestuff = require("../filestuff");

var userstuff = require("../userstuff");
var ajax = {};
ajax.commands = {
    save_signup: function(req, res) {
        function valfail(msg, field) {
            returnSignup(msg, field, true, "signup_fail", '');
        }

        function valEmpty(field, name) {
            if (inData[field] == "") {
                valfail(name + " darf nicht leer sein", field);
            }
            return !(inData[field] == "");
        }

        function returnSignup(Message, field, Error, status, id) {
            res.send(JSON.stringify({
                Message: Message,
                Field: field,
                Error: Error,
                status: status,
                id: id
            }));
        }

        try {
            var inData = req.body;
            if (!inData) {
                valfail("No Data Received", "");
            } else {
                if (valEmpty("password", "Passwort") && valEmpty("password2", "Passwortbestätigung") && valEmpty("email", "Email") && valEmpty("name", "Username")) {
                    if (inData.password !== inData.password2) {
                        valfail("Passwörter stimmen nicht überein", "password2");
                    } else {
                        var passSalt = userstuff.mkPassSalt(inData.password);
                        var saveData = {
                            name: inData.name,
                            password: passSalt.pass,
                            salt: passSalt.salt,
                            email: inData.email.toLower()
                        };
                        dbstuff.saveSignup(saveData, function(savedData) {
                            returnSignup("Benutzer " + savedData.name + " angelegt", "", false, "signup_success", savedData._id);
                        })
                    }
                }
            }
        } catch (exError) {
            console.log(exError);
            returnSignup("error:" + exError.toString(), "", true, "signup_fail", '');
        }
    },
    save: function(req, res) {
        try {
            var inData = JSON.parse(req.body.data);

            dbstuff.setoId(inData, "session_id");

            dbstuff.saveData(inData, function(newId) {
                var session_id = newId;
                var return_data = {
                    Message: "saved " + inData.clickX.length + " lines. id:" + session_id,
                    session_id: session_id
                };
                res.send(JSON.stringify(return_data));
            });
        } catch (exError) {
            console.log(exError);
            var return_data = {
                Message: "error:" + exError.toString(),
                session_id: ""
            };
            res.send(JSON.stringify(return_data));
        }
    },
    load: function(req, res) {
        try {
            var inData = JSON.parse(req.body.data);

            dbstuff.loadData(inData.session_id, function(gotData) {
                console.log("found");
                var session_id = gotData._id.toString();
                var return_data = {
                    Message: "loaded " + gotData.clickX.length + " lines. id:" + session_id,
                    linedata: gotData,
                    session_id: session_id
                };
                res.send(JSON.stringify(return_data));
            });
        } catch (exError) {
            console.log(exError);
            var return_data = {
                Message: "error:" + exError.toString(),
                session_id: ""
            };
            res.send(JSON.stringify(return_data));
        }
    },
    uploadBackground: function(req, res) {
        var inData = req.body;
        var fileData = inData.fileData;
        console.log("gotData");

        var metaData = {
            purpose: "BackGround",
            fileType: "jpg",
            fileName: inData.fileName
        };

        dbstuff.saveFile(metaData, function(newID) {
            var savePath = filestuff.makeName(newID, "jpg");
            console.log("saveName", savePath);
            filestuff.save(fileData, savePath, function(err) {
                console.log("saved");
                var return_data = {
                    Message: "Saved to " + newID + ".jpg",
                    backgroundUrl: "/bg/" + newID
                };
                if (err) {
                    return_data.Message = "Save Failed: " + err.message + " Path: " + savePath + " ID:" + newID;
                    return_data.error = err.message;
                }
                res.send(JSON.stringify(return_data));
            });
        });
    },
    list: function(req, res) {
        try {
            var inData = JSON.parse(req.body.data);
            dbstuff.listData(inData.maxcount ? inData.maxcount : 0, function(gotData) {
                console.log("found");
                for (i = 0; i < gotData.length; i++) {
                    var dataLine = gotData[i];
                    dataLine.session_id = dataLine._id.toString();
                    delete dataLine._id;
                }
                ;
                var return_data = {
                    Message: "found " + gotData.length,
                    count: gotData.length,
                    listdata: gotData
                };
                res.send(JSON.stringify(return_data));
            });
        } catch (exError) {
            console.log(exError);
            var return_data = {
                Message: "error:" + exError.toString(),
                session_id: ""
            };
            res.send(JSON.stringify(return_data));
        }
    }
};

exports.run = function(req, res) {
    var command = req.params.command;
    if (ajax.commands[command]) {
        console.log("ajax command:", command);
        ajax.commands[command](req, res);
    } else {
        console.log("unknown ajax command:", command);
    }
};