var fs = require('fs'), path = require("path");

exports.makeName = function(name, ext) {
    var myPath = fs.realpathSync('.');
    var retPath = path.join(myPath , "files", name + "." + ext);
    return retPath;
};
exports.save = function(saveData, path, callBack) {
    var regex = /^data:.+\/(.+);base64,(.*)$/;

    var matches = saveData.match(regex);
    var data = matches[2];
    var buffer = new Buffer(data, 'base64');
    console.log(path);
    fs.writeFile(path, buffer, callBack);

};
