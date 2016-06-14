var jwt = require('jsonwebtoken');
var config = require('./config');
var secretKey = config.secretKey;
var Admin = require('../models/admin');
var Q = require('q');
var sendJsonResponse = function (res, status, message) {
    res.status(status).json(message);
};

var _idForCategory = function(category) {
    var _id;
    switch (category) {
        case 'Promo':
            _id = 1;
            break;
        case 'Eco':
            _id = 2;
            break;
        case 'Mobile':
            _id = 3;
            break;
    }
    return _id;
};

var imgName = function (mimeType, title) {
    switch (mimeType) {
        case 'image/jpeg':
            return title + '.jpg';
            break;
        case 'image/png':
            return title + '.png';
            break;
    }
};

module.exports = {
    sendJsonResponse: sendJsonResponse,
    _idForCategory: _idForCategory,
    imgName: imgName
};
