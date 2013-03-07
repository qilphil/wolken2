var Db = require('mongodb').Db,
        MongoClient = require('mongodb').MongoClient,
        Server = require('mongodb').Server,
        ObjectID = require('mongodb').ObjectID,
        Binary = require('mongodb').Binary,
        Code = require('mongodb').Code,
        BSON = require('mongodb').pure().BSON;

var client;

var dbutil = {
    open: function() {
        client = new Db('wolken', new Server("127.0.0.1", 27017, {}), {
            w: 1
        });
        client.open(function(err, p_client) {
            if (err) {
                console.log("Can't open DB Connection", err);
                throw err;
            }
        })
    },
    col: function(colName, col_callback) {
        client.collection(colName, function(err, collection) {
            col_callback(err, collection);
        });
    },
    save: function(colName, data, save_callback) {
        dbutil.col(colName, function(err, collection) {
            data.timestamp = new Date();
            collection.save(data, function(err) {
//                console.log(data);
                save_callback(data);
            });
        });
    },
    find: function(colName, find_data, find_callback) {
        // console.log("find", find_data)
        dbutil.col(colName, function(err, collection) {
            collection.find(find_data).toArray(function(err, items) {
                find_callback(items);

            });
        });
    },
    findOne: function(colName, find_data, findone_callback) {
        dbutil.col(colName, function(err, collection) {
            collection.findOne(find_data, function(err, item) {
                findone_callback(item);
            });
        });
    }

};

exports.util = dbutil;

exports.saveData = function(saveData, cb) {
    dbutil.col('linedata', function(err, collection) {
        saveData.timestamp = new Date();
        collection.save(saveData,  function() {
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
    dbutil.find('users', userData, cb);
};

exports.findSession = function(sessionId, cb) {
    var sId = ObjectID.createFromHexString(sessionId);
    //console.log("findSession", sessionId);
    dbutil.findOne('loginsessions', {
        _id: sId
    }, cb);
};

exports.loadData = function(oIdStr, cb) {
    dbutil.col('linedata', function(err, collection) {
        if (oIdStr) {
            collection.find({
                _id: ObjectID.createFromHexString(oIdStr)
            }).toArray(function(err, items) {
                if (items.length > 0)
                    cb(items[0]);
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
            if (items.length > 0)
                cb(items);
        });
    });
};

exports.getImageMeta = function(imageId, cb) {
    dbutil.col('files', function(err, collection) {
        console.log(imageId);
        if (imageId)
        var oId = ObjectID.createFromHexString(imageId);
        collection.find({
            _id: oId
        }).toArray(function(err, items) {
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
                collection.save(results);
            }
            callback(err, results);
        });
    });
};