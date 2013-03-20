var im = require('imagemagick'),
        fs = require('fs'),
        filestuff = require('./filestuff');

var convPath = '../mongodb/bin/convert.exe';

if (fs.existsSync(convPath))
  im.convert.path = fs.realpathSync(convPath);

exports.createThumb = function(id, cb, width, height) {
  var srcPath = filestuff.makeName(id, 'jpg');
  fs.exists(srcPath, function(exists) {
    if (exists) {
      var thumbOptions = {
        srcData: fs.readFileSync(srcPath, 'binary'),
        width: width || 128,
        height: height || 0,
        quality: 0.92
      };
      im.resize(thumbOptions, function(err, stdout, stderr) {
        if (err) 
          throw err;
        fs.writeFile(filestuff.makeName('thumbs/tn_' + id, 'jpg', width, height), stdout, 'binary', cb);
      });
    }
    else
      cb();
  });
};

exports.identify = function(imgPath, cb) {
  im.identify(imgPath, function(error, data) {
    if (error) {
      console.log('IM Error Identify ', imgPath);
      console.log('error:', error);
      throw error;
    };
    cb(data);
  });
};
