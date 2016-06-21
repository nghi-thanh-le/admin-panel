var jwt = require('jsonwebtoken');
var config = require('./config');
var secretKey = config.secretKey;
var Admin = require('../models/admin');
var Q = require('q');
var util = require('util');

var sendJsonResponse = function (res, status, message) {
    res.status(status).json(message);
};

var _idForCategory = function(category) {
    var _id;
    switch (category) {
        case 'Promotional':
            _id = 1;
            break;
        case 'Ecommerce':
            _id = 2;
            break;
        case 'Mobile':
            _id = 3;
            break;
        case 'Custom':
            _id = 4;
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

var validateToken = function (req, res, next) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        var token =  req.headers.authorization.split(' ')[1];
        jwt.verify(token, secretKey, function (err, payload) {
            if(err) {
                return sendJsonResponse(res, 400, err);
            }
            Admin.findOne({
                username: payload.username,
                _id: payload._id
            }, function (err, admin) {
                if(err || !admin) {
                    return sendJsonResponse(res, 400, err);
                }
                next();
            })
        });
    } else {
        return sendJsonResponse(res, 404, {message: 'No token found in headers'});
    }
}

var handlingEdit = function (Model, type, req, res, callback) {
    Model.findById({
        _id: req.body._id
    }, function(err, model) {
        if (err || !model) {
            return sendJsonResponse(res, 404, err);
        }

        model.title = req.body.title;
        model.category = {
            _id: _idForCategory(req.body.category),
            name: req.body.category
        };

        if(type == "Product") {
            model.framework = req.body.framework;
            model.buyDomainUrl = {
                withoutDomainUrl: req.body.withoutDomainUrl,
                withDomainUrl: req.body.withDomainUrl
            };
            model.dateAdded = new Date(req.body.dateAdded);
            model.popularity = req.body.popularity;
            model.previewUrl = req.body.previewUrl;
        } else if(type == "Reference") {
            model.name = req.body.name;
            model.legend = req.body.legend;
            model.description = req.body.description;
            model.technology = req.body.technology;
            model.framework = req.body.framework;
            model.link = req.body.link;
        }
        callback(model, res);
    });
};

module.exports = {
    sendJsonResponse: sendJsonResponse,
    _idForCategory: _idForCategory,
    imgName: imgName,
    validateToken: validateToken,
    handlingEdit: handlingEdit
};
