var Db = require('mongodb').Db,
        MongoClient = require('mongodb').MongoClient,
        Server = require('mongodb').Server,
        ObjectID = require('mongodb').ObjectID,
        Binary = require('mongodb').Binary,
        Code = require('mongodb').Code,
        BSON = require('mongodb').pure().BSON;

var client = new Db('wolken', new Server("127.0.0.1", 27017, {}), {w: 1});

var dbutil = {
    col: function(colname,callback) {
        client.open(function(err, p_client) {
            client.collection(colname, function(err, collection) {
                // run callback on linedata colleciton
                callback(err, collection);
            });
        });
    }
};
exports.util = dbutil;
exports.saveData = function(saveData, cb) {
    dbutil.col('linedata',function(err, collection) {
        saveData.timestamp = new Date();
        collection.save(saveData, {w: 1}, function() {
            cb(saveData._id);
            client.close();
        });
    });
};
exports.loadData = function(oIdStr, cb) {
    dbutil.col('linedata',function(err, collection) {
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
exports.saveFile = function(saveData, cb) {
    dbutil.col('files',function(err, collection) {
        saveData.timestamp = new Date();

        collection.save(saveData, {w: 1}, function() {
            client.close();
            cb(saveData._id);
            
        });
    });
};
exports.listData = function(maxcount, cb) {
    dbutil.col('linedata',function(err, collection) {
        collection.find({timestamp: {$exists: true}}, {limit: maxcount, fields: {timestamp: 1}}).toArray(function(err, items) {
            client.close();
            if (items.length > 0)
                cb(items);

        });
    });
};
exports.getImageMeta = function(imageId, cb) {
    dbutil.col('files',function(err, collection) {
        console.log(imageId);
        var oId = ObjectID.createFromHexString(imageId);
        collection.find({_id: oId}).toArray(function(err, items) {
            console.log(items[0]);
            client.close();
            if (!err && items.length > 0)
                cb(imageId, items[0]);
        });
    });
};
exports.setoId = function(dataObject, memberName) {
    if (dataObject[memberName]) {
        dataObject._id = new ObjectID(dataObject[memberName]);
        delete dataObject[memberName];
    }
};
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