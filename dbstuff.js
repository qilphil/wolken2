var Db = require('mongodb').Db,
        MongoClient = require('mongodb').MongoClient,
        Server = require('mongodb').Server,
        ObjectID = require('mongodb').ObjectID,
        Binary = require('mongodb').Binary,
        Code = require('mongodb').Code,
        BSON = require('mongodb').pure().BSON;



var dbutil = {
    db: null,
    open: function(name, server, port, open_callback) {
        var dbserver = server ? server : "127.0.0.1";
        var dbport = port ? port : 27017;
        var dbname = name ? name : "wolken";
        this.db = new Db(dbname, new Server(dbserver, dbport, {}), {
            w: 1
        });
        this.db.open(function(err, p_client) {
            if (err) {
                console.log('Can\'t open DB Connection', err);
                throw err;
            }
            else {
                if (open_callback)
                    open_callback(err, p_client);
            }
        });
    },
    col: function(colName, col_callback) {
        this.db.collection(colName, function(err, collection) {
            col_callback(err, collection);
        });
    },
    save: function(colName, data, save_callback) {
        var runCallback = function(err) {
//                console.log(data);
            if (save_callback)
                save_callback(data);
        };
        var saveData = function(err, collection) {
            data.timestamp = new Date();
            collection.save(data, runCallback);
        };
        dbutil.col(colName, saveData);
    },
    find: function(colName, find_data, find_callback) {
        // console.log('find', find_data)
        var handleFoundData = function(err, collection) {
            collection.find(find_data).toArray(function(err, items) {
                find_callback(items);
            });
        };
        dbutil.col(colName, handleFoundData);
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
        collection.save(saveData, function() {
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
            purpose: 'BackGround'
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
    //console.log('findSession', sessionId);
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
    var handleFoundMoD = function(err, results) {
        if (!results) {
            var results = {
                dtype: 'WolkenMoD',
                Message: 'Error Message of the Day'
            };
            dbutil.save('wolken', results);
        }
        callback(err, results);
    };
    dbutil.findOne('wolken', {dtype: 'WolkenMoD'}, handleFoundMoD);
};