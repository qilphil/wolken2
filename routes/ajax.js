/*
 * GET users listing.
 */
var dbstuff = require('../dbstuff'),
        filestuff = require('../filestuff'),
        imgstuff = require('../imgstuff'),
        userstuff = require('../userstuff');
var signup = require('./signup');
var image = require('./image');
var ajax = {};


ajax.commands = {
  save: function(req, res, next) {
    try {
      var inData = JSON.parse(req.body.data);
      var doneSaving = function(newId) {
        var session_id = newId;
        var return_data = {
          Message: 'saved ' + inData.clickX.length + ' lines. id:' + session_id,
          session_id: session_id
        };
        res.send(JSON.stringify(return_data));
      }
      dbstuff.setoId(inData, 'session_id');
      dbstuff.saveData(inData,doneSaving );
    } catch (exError) {
      console.log(exError);
      var return_data = {
        Message: 'error:' + exError.toString(),
        session_id: ''
      };
      res.send(JSON.stringify(return_data));
    }
  },
  load: function(req, res, next) {
    try {
      var inData = JSON.parse(req.body.data);
      var doneLoading = function(gotData) {
        console.log('found');
        var session_id = gotData._id.toString();
        var return_data = {
          Message: 'loaded ' + gotData.clickX.length + ' lines. id:' + session_id,
          linedata: gotData,
          session_id: session_id
        };
        res.send(JSON.stringify(return_data));
      };
      dbstuff.loadData(inData.session_id, doneLoading);
    } catch (exError) {
      console.log(exError);
      var return_data = {
        Message: 'error:' + exError.toString(),
        session_id: ''
      };
      res.send(JSON.stringify(return_data));
    }
  },
  uploadBackground: image.uploadBackground,
  list: function(req, res, next) {
    try {
      var inData = JSON.parse(req.body.data);
      dbstuff.listData(inData.maxcount ? inData.maxcount : 0, function(gotData) {
        for (i = 0, len = gotData.length; i < len; i++) {
          var dataLine = gotData[i];
          dataLine.session_id = dataLine._id.toString();
          delete dataLine._id;
        }
        ;
        var return_data = {
          Message: 'found ' + gotData.length,
          count: gotData.length,
          listdata: gotData
        };
        res.send(JSON.stringify(return_data));
      });
    } catch (exError) {
      console.log(exError);
      var return_data = {
        Message: 'error:' + exError.toString(),
        session_id: ''
      };
      res.send(JSON.stringify(return_data));
    }
  }
};
ajax.commands.save_signup = signup.save_signup;
ajax.commands.do_login = signup.do_login;

exports.run = function(req, res, next) {
  var command = req.params.command;
  if (ajax.commands[command]) {
    console.log('ajax command:', command);
    ajax.commands[command](req, res, next);
  } else {
    console.log('unknown ajax command:', command);
  }
};