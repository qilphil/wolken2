
/*
 * GET home page.
 */
var Db = require('mongodb').Db,
        MongoClient = require('mongodb').MongoClient,
        Server = require('mongodb').Server,
        ReplSetServers = require('mongodb').ReplSetServers,
        ObjectID = require('mongodb').ObjectID,
        Binary = require('mongodb').Binary,
        GridStore = require('mongodb').GridStore,
        Code = require('mongodb').Code,
        BSON = require('mongodb').pure().BSON,
        assert = require('assert');

var client = new Db('test', new Server("127.0.0.1", 27017, {}), {w: 1});


exports.index = function(req, res) {
    client.open(function(err, p_client) {
        client.collection('wolken', function(err, collection) {
            // Locate all the entries using find
            collection.findOne({dtype: "WolkenMoD"}, function(err, results) {
                res.render('index', {title: 'Express', body: results.Message});
                // Let's close the db
                client.close();
            });
        });
    });
};