var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    ObjectID = require('mongodb').ObjectID,
    Binary = require('mongodb').Binary,
    Code = require('mongodb').Code,
    BSON = require('mongodb').pure().BSON;

var client = new Db('wolken', new Server("127.0.0.1", 27017, {}), {
    w: 1
});

var dbutil = {
    col: function(colName, col_callback) {
        client.open(function(err, p_client) {
            client.collection(colName, function(err, collection) {
                col_callback(err, collection);
            });
        });
    },
    save: function(colName, data, save_callback) {
        dbutil.col(colName, function(err, collection) {
            data.timestamp = new Date();
            collection.save(data, {
                w: 1
            }, function(err) {
                client.close();
                console.log(data);
                save_callback(data);
            });
        });
    },
    find: function(colName, find_data, find_callback) {
        console.log("find", find_data)
        dbutil.col(colName, function(err, collection) {
            collection.find(find_data).toArray(function(err, items) {
                client.close();
                find_callback(items);

            });
        });
    },
    findOne: function(colName, find_data, findone_callback) {
        dbutil.col(colName, function(err, collection) {
            collection.findOne(find_data, function(err, item) {
                client.close();
                findone_callback(item);
            });
        });
    }

};

exports.util = dbutil;

exports.saveData = function(saveData, cb) {
    dbutil.col('linedata', function(err, collection) {
        saveData.timestamp = new Date();
        collection.save(saveData, {
            w: 1
        }, function() {
            client.close();
            cb(saveData._id);
        });
    });
};
exports.getImages = function(max, cb) {
    var limit = {};
    if (!cb) {
        cb = max;
    } else {
        limit = {
            limits: max
        };
    }

    dbutil.col('files', function(err, collection) {
        collection.find({
            timestamp: {
                $exists: true
            },
            purpose: "BackGround"
        }, limit).toArray(function(err, items) {
            client.close();
             cb(items);
        });
    });
};
exports.saveSignup = function(saveData, cb) {
    dbutil.save('users', saveData, cb);
};
exports.saveSession = function(sessionData, cb) {
    dbutil.save('loginsessions', sessionData, cb);
};
exports.findUser = function(userData, cb) {
    //console.log("findUser",userData);
    dbutil.find('users', userData, cb);
};
exports.findSession = function(sessionId, cb) {
    var sId = ObjectID.createFromHexString(sessionId);
    console.log("findSession", sessionId);
    dbutil.findOne('loginsessions', {
        _id: sId
    }, cb);
};
exports.loadData = function(oIdStr, cb) {
    dbutil.col('linedata', function(err, collection) {
        if (oIdStr) {
            var oId = ObjectID.createFromHexString(oIdStr);
            collection.find({
                _id: oId
            }).toArray(function(err, items) {
                client.close();
                if (items.length > 0) cb(items[0]);
            });
        }
    });
};

exports.saveFile = function(saveData, cb) {
    dbutil.save('files', saveData, cb);
};

exports.listData = function(maxcount, cb) {
    dbutil.col('linedata', function(err, collection) {
        collection.find({
            timestamp: {
                $exists: true
            }
        }, {
            limit: maxcount,
            fields: {
                timestamp: 1
            }
        }).toArray(function(err, items) {
            client.close();
            if (items.length > 0) cb(items);
        });
    });
};

exports.getImageMeta = function(imageId, cb) {
    dbutil.col('files', function(err, collection) {
        //console.log(imageId);
        var oId = ObjectID.createFromHexString(imageId);
        collection.find({
            _id: oId
        }).toArray(function(err, items) {
            client.close();
            if (!err && items.length > 0) cb(imageId, items[0]);
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
            collection.findOne({
                dtype: "WolkenMoD"
            }, function(err, results) {
                if (!results) {
                    var results = {
                        dtype: "WolkenMoD",
                        Message: "Error Message of the Day"
                    };
                    collection.save(results, {
                        w: 0
                    });
                }
                client.close();
                callback(err, results);
            });
        });
    });
};