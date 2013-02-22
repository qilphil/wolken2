
/*
 * GET users listing.
 */
var dbstuff = require("../dbstuff");

var ajax = {};
ajax.commands = {
    save: function(req, res) {
        try
        {
            var inData = JSON.parse(req.body.data);

            dbstuff.setoId(inData, "session_id");
            
            dbstuff.saveData(inData, function(newId) {
                var session_id = dbstuff.util.oId2b64(newId)
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

            dbstuff.loadData(dbstuff.util.b642oId(inData.session_id), function(gotData) {
                console.log("found");
                var session_id = dbstuff.util.oId2b64(gotData._id);
                var return_data = {
                    Message: "loaded " + gotData.clickX.length + " lines. id:" + session_id,
                    linedata:gotData,
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
    }
};

exports.run = function(req, res) {
    var command = req.params.command;
    if (ajax.commands[command]) {
        console.log("ajax command:",command);
        ajax.commands[command](req, res);
    }
    else {
        console.log("unknown ajax command:",command);
    }
};