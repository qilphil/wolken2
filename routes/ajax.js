
/*
 * GET users listing.
 */
var dbstuff = require("../dbstuff"),
        filestuff = require("../filestuff");

var ajax = {};
ajax.commands = {
    save: function(req, res) {
        try
        {
            var inData = JSON.parse(req.body.data);

            dbstuff.setoId(inData, "session_id");

            dbstuff.saveData(inData, function(newId) {
                var session_id = newId;
                var return_data = {
                    Message: "saved " + inData.clickX.length + " lines. id:" + session_id,
                    session_id: session_id
                }
                res.send(JSON.stringify(return_data));
            });
        }
        catch (exError) {
            console.log(exError);
            var return_data = {
                Message: "error:" + exError.toString(),
                session_id: ""
            }
            res.send(JSON.stringify(return_data));
        }
    },
    load: function(req, res) {
        try
        {
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
        }
        catch (exError) {
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
            console.log("saveName",savePath);
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
        try
        {
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
        }
        catch (exError) {
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
    }
    else {
        console.log("unknown ajax command:", command);
    }
};