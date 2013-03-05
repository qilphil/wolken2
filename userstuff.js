var crypto = require("crypto"),
    shaHasher = crypto.createHash('sha1');
exports.getSalt = function() {
    return crypto.randomBytes(8).toString("base64");
}
exports.mkPassword = function(password, salt) {
    var pickledPass = password + salt;
    shaHasher.update(pickledPass);
    return shaHasher.digest('base64');
}
exports.mkPassSalt = function(password) {
    var salt = exports.getSalt();
    var pickledPass = password + salt;
    shaHasher.update(pickledPass);
    return {
        pass: shaHasher.digest('base64'),
        salt: salt
    };
}