var crypto = require("crypto");
exports.getSalt = function() {
    return crypto.randomBytes(8).toString("base64");
}
exports.mkPassword = function(password, salt) {

    var shaHasher = crypto.createHash('sha1')
    var pickledPass = password + salt;
    shaHasher.update(pickledPass);
    return shaHasher.digest('base64');
}
exports.mkPassSalt = function(password) {

    var shaHasher = crypto.createHash('sha1')
    var salt = exports.getSalt();
    var pickledPass = password + salt;
    shaHasher.update(pickledPass,'utf8');
    return {
        pass: shaHasher.digest('base64'),
        salt: salt
    };
}