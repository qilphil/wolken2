var im = require('imagemagick'),
    fs = require('fs'),
    filestuff = require('./filestuff');

var filename = fs.realpathSync("files/512e4031478a6a4800000001.jpg");
var convPath = fs.realpathSync("../mongodb/bin/convert.exe");

if (fs.existsSync(convPath)) im.convert.path = convPath;

exports.createThumb = function(id, cb) {
    var thumbOptions = {
        srcData: fs.readFileSync(filestuff.makeName(id, 'jpg'), 'binary'),
        width: 128,
        height:128
    };
    im.resize(thumbOptions, function(err, stdout, stderr) {
        if (err) throw err;
        fs.writeFileSync(filestuff.makeName('thumbs/tn_' + id, 'jpg'), stdout, 'binary');
    })
    cb(thumbOptions);
}
var test_id = '512e4425e02a032800000008';
exports.createThumb(test_id, function(data) {
    var targetname = filestuff.makeName('thumbs/tn_' + test_id, 'jpg');
    im.identify(targetname, function(error, data) {
        console.log(data);
    })
})