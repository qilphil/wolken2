
/*
 * GET users listing.
 */
var dbstuff = require("../dbstuff");
var filestuff = require("../filestuff");
var imgstuff = require("../imgstuff");
var fs = require("fs");
exports.sendThumbnail = function(req, res) {
    var imageId = req.params.imageid;
    console.log(imageId);
    dbstuff.getImageMeta(imageId, function(imageId, metaData) {
        res.sendfile(filestuff.makeName("thumbs/tn_" + imageId, "jpg"));
    });
};
exports.sendBackground = function(req, res) {
    var imageId = req.params.imageid;
    dbstuff.getImageMeta(imageId, function(imageId, metaData) {
        var imgPath = filestuff.makeName(imageId, "jpg");
        fs.exists(imgPath, function( exists)
        {
            if (exists) {
                res.sendfile(imgPath);
            }
            else {
                res.statusCode = 404;
                res.send(imageId + ".jpg not found");
            }
        });
    });
};

exports.index = function(req, res) {
    dbstuff.getMoD(function(err, results) {
        res.render('index', {
            title: 'Express',
            body: results.Message,
            load_id: req.params.sessionid
        });
    });
};
exports.uploadBackground = function(req, res) {
    var inData = req.body;
    var fileData = inData.fileData;

    var metaData = {
        purpose: "BackGround",
        fileType: "jpg",
        fileName: inData.fileName,
        user_id: req.currentUser ? req.currentUser._id : '',
        session_id: req.session.session_id || ''
    };

    dbstuff.saveFile(metaData, function(savedData) {
        var newID = savedData._id;
        var savePath = filestuff.makeName(newID, "jpg");
        filestuff.save(fileData, savePath, function(err) {
            imgstuff.identify(savePath, function(imgMeta) {
                metaData.imageMeta = imgMeta;
                dbstuff.saveFile(metaData, function(newMetaData) {
                    var return_data = {
                        Message: "Saved to " + newID + ".jpg",
                        backgroundUrl: "/bg/" + newID
                    };
                    console.log("fullData", newMetaData);
                    if (err) {
                        return_data.Message = "Save Failed: " + err.message + " Path: " + savePath + " ID:" + newID;
                        return_data.status = "bgsave_failed",
                                return_data.error = true;
                    }
                    res.send(JSON.stringify(return_data));
                });
            });
        });
    });
};