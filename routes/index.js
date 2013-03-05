/*
 * GET home page.
 */
var dbstuff=require("../dbstuff");

exports.index = function(req, res) {
    dbstuff.getMoD(function(err,results){
        res.render('index', {user:req.currentUser,title: 'Express', body: results.Message,load_id:""});
    });
};