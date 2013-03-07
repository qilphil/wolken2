var fs = require('fs'), path = require("path");

exports.makeName = function(name, ext, width, height) {
    var myPath = fs.realpathSync('.');

    var sizemark = width ? (height ? "_" + width + "x" + height : "_" + width) : "";
    var retPath = path.join(myPath, "files", name + sizemark + "." + ext);
    return retPath;
};
exports.save = function(saveData, path, callBack) {
    var regex = /^data:.+;base64,(.*)$/;
    var buffer = new Buffer(saveData.match(regex)[1], 'base64');
    fs.writeFile(path, buffer, callBack);

};
exports.sendJpgPath = function(jpgPath, res) {
    fs.exists(jpgPath, function(exists) {
        if (exists) {
            res.sendfile(jpgPath);
        }
        else {
            res.statusCode = 404;
            res.send(jpgPath + " not found");
        }
    });
};

