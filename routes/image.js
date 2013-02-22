
/*
 * GET users listing.
 */
var dbstuff = require("../dbstuff");
exports.index = function(req, res) {
    console.log(req.params);
    dbstuff.getMoD(function(err, results) {
        res.render('index', {
            title: 'Express',
            body: results.Message,
            load_id: req.params.sessionid 
        });
    });

};