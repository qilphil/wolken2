
/*
 * GET home page.
 */
var dbstuff=require("../dbstuff");

exports.index = function(req, res) {
	dbstuff.getImages(function(err,results){
        res.render('index', {title: 'Admin', body: results.Message,load_id:""});
    })
};