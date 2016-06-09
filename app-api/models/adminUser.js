var mongoose = require('mongoose');

var adminUser = mongoose.Schema({
    username: String,
    password: String
});

module.exports = mongoose.model('adminUser', adminUser);
