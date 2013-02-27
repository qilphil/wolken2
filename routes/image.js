
/*
 * GET users listing.
 */
var dbstuff = require("../dbstuff");
var filestuff = require("../filestuff");
exports.sendBackground = function(req, res) {
    var imageId = req.params.imageid;
    console.log(imageId);
    dbstuff.getImageMeta(imageId, function(imageId, metaData) {
        res.sendfile(filestuff.makeName(imageId, "jpg"));
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