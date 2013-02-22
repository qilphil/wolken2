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
var client = new Db('wolken', new Server("127.0.0.1", 27017, {}), {w: 1});

var dbutil = {
    open: function() {
    },
    col_lineData: function(callback) {
        client.open(function(err, p_client) {
            client.collection('linedata', function(err, collection) {
                // run callback on linedata colleciton
                callback(err, collection);
            });
        });
    },
    oId2b64: function(oId) {
        var buf = new Buffer(oId.toString(), "hex");
        return buf.toString('base64');
    },
    b642oId: function(oId) {
        buf = new Buffer(oId, 'base64');
        return  buf.toString('hex');
    }
};
exports.util = dbutil;
exports.saveData = function(saveData, cb) {
    dbutil.col_lineData(function(err, collection) {
        if (saveData._id) {
            collection.save(saveData, {w: 1}, function() {
                cb(saveData._id);
                client.close();
                console.log(saveData,"update",saveData.clickX.length);
                console.dir(saveData);
            });
        }
        else {
            collection.save(saveData, {w: 1}, function() {
                cb(saveData._id);
                client.close();
                console.log(saveData,"save",saveData.clickX.length);
                console.dir(saveData);
            });
        }
    });
};
exports.loadData = function(oIdStr, cb) {
    dbutil.col_lineData(function(err, collection) {
        if (oIdStr) {
            var oId = ObjectID.createFromHexString(oIdStr);
            collection.find({_id: oId}).toArray(function(err, items) {
                if (items.length > 0)
                    cb(items[0]);
                client.close();
            });
        }
    });
};
exports.setoId = function(dataObject, memberName) {
    if (dataObject[memberName]) {
        dataObject._id = new ObjectID(dbutil.b642oId(dataObject[memberName]));
        delete dataObject[memberName];
    }
}
exports.getMoD = function(callback) {
    client.open(function(err, p_client) {
        client.collection('wolken', function(err, collection) {
            // Locate all the entries using find
            collection.findOne({dtype: "WolkenMoD"}, function(err, results) {
                if (!results) {
                    var results = {dtype: "WolkenMoD", Message: "Error Message of the Day"};
                    collection.save(results, {w: 0});
                }
                client.close();
                callback(err, results);

            });
        });
    });
};