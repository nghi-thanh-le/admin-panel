var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Admin = mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

var noop = function () {};

Admin.methods.checkPassword = function (guessPassword, callback) {
    bcrypt.compare(guessPassword, this.password, function (err, isMatch) {
        if(err) {
            return callback(err)
        }
        callback(null, isMatch);
    });
};

Admin.methods.hashedPassword = function (password, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        if(err) {
            return callback(err);
        }
        bcrypt.hash(password, salt, noop, function (err, hashedPassword) {
            return callback(null, hashedPassword);
        });
    });
};

module.exports = mongoose.model('admin', Admin, 'admin');
