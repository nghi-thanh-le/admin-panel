var jwt = require('jsonwebtoken');
var config = require('./config');
var secretKey = config.secretKey;
var Admin = require('../models/admin');

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

var handlingEdit = function (productModel, req, res, callback) {
    productModel.findById({
        _id: req.body._id
    }, function(err, product) {
        if (err || !product) {
            return sendJsonResponse(res, 404, err);
        }

        product.title = req.body.title;
        product.category = {
            _id: _idForCategory(req.body.category),
            name: req.body.category
        };
        product.framework = req.body.framework;
        product.buyDomainUrl = {
            withoutDomainUrl: req.body.withoutDomainUrl,
            withDomainUrl: req.body.withDomainUrl
        };
        product.dateAdded = new Date(req.body.dateAdded);
        product.popularity = req.body.popularity;
        product.previewUrl = req.body.previewUrl;

        callback(product, res);
    });
};

module.exports = {
    sendJsonResponse: sendJsonResponse,
    _idForCategory: _idForCategory,
    imgName: imgName,
    validateToken: validateToken,
    handlingEdit: handlingEdit
};
