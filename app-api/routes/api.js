var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Admin = require('../models/admin');
var path = require('path');
var app = express();
var fs = require('fs');
var jwt = require('jsonwebtoken');
var multer = require('multer');
var helpers = require('../lib/helpers');

var Products = require('../models/products');
var Admin = require('../models/admin');

var secretKey = require('../lib/config').secretKey;
var pathForUploadPic = path.join(__dirname, '../../public/img');
var pathForCategories = path.join(__dirname, '../models/categories.json');

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, pathForUploadPic);
    },
    filename: function(req, file, cb) {
        cb(null, helpers.imgName(file.mimetype, req.body.title));
    }
});

var upload = multer({
    storage: storage
}).single('file');

/* User Routes. */
router.post('/product/*', helpers.validateToken);

router.get('*', helpers.validateToken);

router.get('/products', function(req, res) {
    Products.find({}, function(err, products) {
        if (err) {
            return helpers.sendJsonResponse(res, 400, err);
        }
        helpers.sendJsonResponse(res, 200, products);
    })
});

router.get('/product/:productTitle', function(req, res) {
    var productTitle = req.params.productTitle;
    if (!productTitle) {
        return helpers.sendJsonResponse(res, 400, {
            message: 'Product title not found'
        });
    }
    Products.findOne({
        title: productTitle
    }, function(err, product) {
        if (err || !product) {
            return helpers.sendJsonResponse(res, 404, {
                message: 'Product not found'
            });
        }
        helpers.sendJsonResponse(res, 200, product);
    });
});

router.get('/categories', function (req, res) {
    fs.readFile(pathForCategories, 'utf8', function (err, categories) {
        if(err) {
            return helpers.sendJsonResponse(res, 400, err);
        }
        categories = JSON.parse(categories);
        helpers.sendJsonResponse(res, 200, categories);
    });
});

router.post('/product/add', function(req, res) {
    upload(req, res, function (err) {
        if(err) {
            return helpers.sendJsonResponse(res, 400, err);
        }
        var post = {
            title: req.body.title,
            category: req.body.category,
            framework: req.body.framework,
            withDomainUrl: req.body.withDomainUrl,
            withoutDomainUrl: req.body.withoutDomainUrl,
            popularity: req.body.popularity,
            previewUrl: req.body.previewUrl
        };

        var product = new Products({
            title: post.title,
            category: {
                _id: helpers._idForCategory(post.category),
                name: post.category
            },
            framework: post.framework,
            imgUrl: helpers.imgName(req.file.mimetype, post.title),
            buyDomainUrl: {
                withoutDomainUrl: post.withoutDomainUrl,
                withDomainUrl: post.withDomainUrl
            },
            popularity: post.popularity,
            previewUrl: post.previewUrl
        });
        product.save(function(err, savedProduct) {
            if (err) {
                return helpers.sendJsonResponse(res, 400, err);
            }
            delete req.file;
            helpers.sendJsonResponse(res, 201, savedProduct);
        });
    });
});

// V1 is receiving the input form with image
// req.file is an object containing information about image
router.post('/product/edit', function(req, res) {
    upload(req, res, function (err) {
        if(err) {
            return helpers.sendJsonResponse(res, 400, err);
        }

        helpers.handlingEdit(Products, req, res, function (product, response) {
            fs.unlink(path.join(pathForUploadPic, product.imgUrl), function(err) {
                if (err) {
                    return helpers.sendJsonResponse(response, 400, err);
                }
                product.imgUrl = helpers.imgName(req.file.mimetype, req.body.title);
                delete req.file;
                product.save(function(err) {
                    if (err) {
                        return helpers.sendJsonResponse(response, 400, err);
                    }
                    helpers.sendJsonResponse(response, 200, product);
                });
            });
        });
    });
});

// V1 is receiving the input form without image
router.post('/product/editV2', function(req, res) {
    helpers.handlingEdit(Products, req, res, function (product, response) {
        var oldImgUrl = product.imgUrl;
        var newImgUrl = product.title + product.imgUrl.slice(product.imgUrl.indexOf('.'));
        fs.rename(path.join(pathForUploadPic, oldImgUrl), path.join(pathForUploadPic, newImgUrl), function(err) {
            if (err) {
                return helpers.sendJsonResponse(response, 400, err);
            }
            product.imgUrl = newImgUrl;
            product.save(function(err) {
                if (err) {
                    return helpers.sendJsonResponse(response, 400, err);
                }
                helpers.sendJsonResponse(response, 200, product);
            });
        });
    });
});

router.post('/product/delete', function(req, res) {
    Products.findByIdAndRemove(req.body._id, function(err, product) {
        if (err || !product) {
            return helpers.sendJsonResponse(res, 404, err);
        }

        fs.unlink(path.join(pathForUploadPic, product.imgUrl), function(err) {
            if (err) {
                return helpers.sendJsonResponse(res, 400, err);
            }
            helpers.sendJsonResponse(res, 200, {
                message: 'Product deleted'
            });
        });
    });
});

router.post('/login', function(req, res) {
    var post = {
        username: req.body.username,
        password: req.body.password
    };

    Admin.findOne({
        username: post.username
    }, function(err, admin) {
        if (err) {
            return helpers.sendJsonResponse(res, 500, err);
        }
        if (!admin) {
            return helpers.sendJsonResponse(res, 404, {
                message: 'Username not found'
            });
        }

        admin.checkPassword(post.password, function(err, match) {
            if (err) {
                helpers.sendJsonResponse(res, 500, err);
            } else if (!match) {
                helpers.sendJsonResponse(res, 500, {
                    message: 'Invalid password'
                });
            } else {
                var token = jwt.sign({
                    _id: admin._id,
                    username: admin.username
                }, secretKey, {
                    expiresIn: 2 * 24 * 60 * 60
                });
                helpers.sendJsonResponse(res, 200, token);
            }
        });
    });
});

module.exports = router;
