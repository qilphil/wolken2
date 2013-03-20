
/*
 * GET users listing.
 */
var dbstuff = require('../dbstuff');
var filestuff = require('../filestuff');
var imgstuff = require('../imgstuff');
var fs = require('fs');

exports.sendThumbnail = function(req, res, next) {
    var imageId = req.params.imageid;
    console.log(imageId);
    var width, height;
    if (req.params.wxh) {
        var w_by_h = req.params.wxh.split('x');
        if (parseInt(w_by_h[0]) > 0)
        {
            width = parseInt(w_by_h[0]);
            if (parseInt(w_by_h[1]))
                height = parseInt(w_by_h[1]);
        }
    }
    var thumbPath = filestuff.makeName('thumbs/tn_' + imageId, 'jpg', width, height);
    var sendit = function() {
        filestuff.sendJpgPath(thumbPath, res);
    };
    fs.exists(thumbPath, function(exists) {
        exists ? sendit() : imgstuff.createThumb(imageId, sendit, width, height);
    });
};

exports.sendBackground = function(req, res, next) {
    var imageId = req.params.imageid;
    var imgPath = filestuff.makeName(imageId, 'jpg');
    filestuff.sendJpgPath(imgPath, res);
};

exports.index = function(req, res, next) {
    dbstuff.getMoD(function(err, results) {
        res.render('index', {
            title: 'Express',
            body: results.Message,
            load_id: req.params.sessionid
        });
    });
};
exports.uploadBackground = function(req, res, next) {
    var inData = req.body;
    var fileData = inData.fileData;

    var metaData = {
        purpose: 'BackGround',
        fileType: 'jpg',
        fileName: inData.fileName,
        user_id: req.currentUser ? req.currentUser._id : '',
        session_id: req.session.session_id || ''
    };

    dbstuff.saveFile(metaData, function(savedData) {
        var newID = savedData._id;
        var savePath = filestuff.makeName(newID, 'jpg');
        filestuff.save(fileData, savePath, function(err) {
            imgstuff.identify(savePath, function(imgMeta) {
                metaData.imageMeta = imgMeta;
                dbstuff.saveFile(metaData, function(newMetaData) {
                    var return_data = {
                        Message: 'Saved to ' + newID + '.jpg',
                        status: 'bgsave_success',
                        error: false,
                        backgroundUrl: '/bg/' + newID
                    };
                    if (err) {
                        return_data.Message = 'Save Failed: ' + err.message + ' Path: ' + savePath + ' ID:' + newID;
                        return_data.status = 'bgsave_failed';
                        return_data.error = true;
                    }
                    res.send(JSON.stringify(return_data));
                });
            });
            imgstuff.createThumb(newID);
        });
    });
};