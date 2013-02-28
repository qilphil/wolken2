var fs = require('fs'), path = require("path");

exports.makeName = function(name, ext) {
    var myPath = fs.realpathSync('.');
    var retPath = path.join(myPath , "files", name + "." + ext);
    return retPath;
};
exports.save = function(saveData, path, callBack) {
    var regex = /^data:.+;base64,(.*)$/;
    var buffer = new Buffer(saveData.match(regex)[1], 'base64');
    fs.writeFile(path, buffer, callBack);

};
