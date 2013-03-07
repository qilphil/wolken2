/*
 * GET home page.
 */
var dbstuff = require("../dbstuff");

exports.index = function(req, res, next) {
    dbstuff.getImages(function(results) {
        var message = results ? "Images: " + results.length : "no Images";

        console.log(req.currentUser);
        res.render('admin', {
            title: 'Admin',
            images: results,
            body: message
        });
    });
};
exports.setmod = function(req, res, next) {
    dbstuff.getMoD(function(err,MoDobj) {
        res.render('setmod', {
            title: 'Set Message of the Day',
            currentMoD: MoDobj.Message
        });
    });
};
