/*
 * GET home page.
 */
var dbstuff = require("../dbstuff");
var path = require("path");
var url = require('url');
var request = require('request');
var flickr_url = "http://api.flickr.com/services/feeds/photos_public.gne";
var fak_public = "eade4230d9a92afa77230571bd138458";
var fak_private = "1b07836226eb18b9";
var jsonFlickrFeed=function(json) {
     return json;
};
exports.index = function(req, res, next) {
    var flUrlObj = url.parse(flickr_url);
    flUrlObj.query = {
        format: "json",
        tags: "clouds"
    };
    var fail = function(err) {
        res.render('flickr', {
            title: 'flickr Connection',
            Message: "Fail:" + err.toString()
        });
    };
    var getUrl=url.format(flUrlObj);
    request(getUrl, function(err, response, flickrJson) {
        var jsonPure = flickrJson.replace(/^jsonFlickrFeed\(/,'').replace(/\)\s*^/,'');
        if (jsonPure) {
            if (!err && response.statusCode === 200) {
                var flickrData = eval(flickrJson);
                res.render('flickr', {
                    title: 'flickr Connection',
                    Message: "Success",
                    images: flickrData.items
                });
            } else
                fail("rss Load Error "+err.toString());
        }
        else
            fail("Json Error");
      console.log(getUrl);
    });
};
