/*
 * GET home page.
 */
var dbstuff = require("../dbstuff");

exports.index = function(req, res) {
  dbstuff.getImages(function( results) {
    var message = results ? "Images: " + results.length : "no Images";

    console.log(req.currentUser);
    res.render('admin', {
      title: 'Admin',
      images:results,
      body: message
    });
  });
};