
/*
 * GET users listing.
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
var ajax = {};
ajax.functions = {
    save:function(req,res){
    try
    {
    var inData = JSON.parse(req.body.data);
    console.log(inData);
    }
    catch (exError){
        res.send("error: "+ exError.Message);
    }
    res.send("got "+inData.clickX.length+" lines");
        
    }
};

exports.run = function(req, res){
    var command=req.params.command;
    console.log(command);
  if (ajax.functions[command]) {
      ajax.functions[command](req,res);
  }
};