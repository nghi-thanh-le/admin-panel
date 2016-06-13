var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Admin = require('../models/admin');
var path = require('path');
var app = express();
var fs = require('fs');
var multer = require('multer');
var Q = require('q');
var util = require('util');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var helpers = require('../lib/helpers');

var Products = require('../models/modal').Products;
var Categories = require('../models/modal').Categories;
var Admin = require('../models/admin');

var secretKey = require('../lib/config').secretKey;
var pathForUploadPic = path.join(__dirname, '../../public/img');
var upload = multer({
    dest: pathForUploadPic
});

/* User Routes. */
router.post('/product/*', expressJwt({secret: secretKey}), function (req, res, next) {
    Admin.findOne({
        username: req.user.username,
        _id: req.user.id
    }, function (err, admin) {
        if(err) {
            return helpers.sendJsonResponse(res, 200, err);
        }
        next();
    });
});


router.get('/products', function(req, res) {
    Products.find({}, function(err, products) {
        if (err) {
            helpers.sendJsonResponse(res, 404, {
                message: 'Products list not found'
            });
        }
        helpers.sendJsonResponse(res, 200, products);
    })
});

router.get('/product/:productTitle', function(req, res) {
    var productTitle = req.params.productTitle;
    if (util.isNullOrUndefined(productTitle)) {
        helpers.sendJsonResponse(res, 500, {
            message: 'Empty produc title'
        });
    } else {
        Products.findOne({
            title: productTitle
        }, function(err, product) {
            if (err) {
                helpers.sendJsonResponse(res, 404, {
                    message: 'Product not found'
                });
            }
            helpers.sendJsonResponse(res, 200, product);
        });
    }
});

router.get('/categoryList', function(req, res) {
    Categories.find({}, function(err, category) {
        if (err) throw err;
        helpers.sendJsonResponse(res, 200, category);
    });
});

router.post('/product/add', upload.single('file'), function(req, res) {
    var post = {
        title: req.body.title,
        category: req.body.category,
        framework: req.body.framework,
        withDomainUrl: req.body.withDomainUrl,
        withoutDomainUrl: req.body.withoutDomainUrl,
        popularity: req.body.popularity,
        previewUrl: req.body.previewUrl
    };

    var product = new Products();
    product.title = post.title;
    product.category = {
        _id: helpers._idForCategory(post.category),
        name: post.category
    };
    product.framework = post.framework;
    product.imgUrl = req.file.originalname;
    product.buyDomainUrl = {
        withoutDomainUrl: post.withoutDomainUrl,
        withDomainUrl: post.withDomainUrl
    };
    product.popularity = post.popularity;
    product.previewUrl = post.previewUrl;

    product.handleImgUpload(req.file).then(function() {
        product.save(function(err, savedProduct) {
            if (err) {
                helpers.sendJsonResponse(res, 401, err);
            }
            delete req.file;
            helpers.sendJsonResponse(res, 200, savedProduct);
        }, function(err) {
            helpers.sendJsonResponse(res, 500, err);
        });
    });
});

router.post('/product/edit', upload.single('file'), function(req, res) {
    Products.findById({
        _id: req.body._id
    }, function(err, product) {
        if (err || !product) {
            helpers.sendJsonResponse(res, 500, {
                message: 'Product not found'
            });
        }

        product.title = req.body.title;
        product.category = {
            _id: helpers._idForCategory(req.body.category),
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


        if (req.file) {
            // replace the old img file....
            fs.unlink(path.join(pathForUploadPic, product.imgUrl), function(err) {
                if (err) {
                    throw err;
                }
            });
            product.handleImgUpload(req.file).then(function(imgName) {
                product.imgUrl = req.file.originalname;
                delete req.file;
                product.save(function(err) {
                    if (err) {
                        throw err;
                    }
                    helpers.sendJsonResponse(res, 200, product);
                });
            });
        } else {
            product.save(function(err) {
                if (err) {
                    throw err;
                }
                helpers.sendJsonResponse(res, 200, product);
            });
        }
    });
});

router.post('/product/testing', function (req, res) {
    helpers.sendJsonResponse(res, 200, 'you got hereeeeeee!!!!!');
});

router.post('/product/delete', function(req, res) {
    Products.findByIdAndRemove(req.body._id, function(err, product) {
        if (err) {
            throw err;
        }

        fs.unlink(path.join(pathForUploadPic, product.imgUrl), function(err) {
            if (err) {
                throw err;
            }
            helpers.sendJsonResponse(res, 200, null);
        });
    });
});

router.post('/admin', function(req, res) {
    var post = {
        username: req.body.username,
        password: req.body.password,
    };

    var admin = new Admin();
    admin.hashedPassword(post.password, function(err, hashedPassword) {
        if (err) {
            return sendJsonResponse(res, 500, err);
        } else {
            admin.username = post.username;
            admin.password = hashedPassword;

            admin.save(function(err) {
                if (err) {
                    return helpers.sendJsonResponse(res, 401, {
                        success: false,
                        message: 'That email address already exists.'
                    });
                }
                helpers.sendJsonResponse(res, 200, {
                    success: true,
                    message: 'Successfully created new user.'
                });
            });
        }
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
                    expiresIn: 60 * 5
                });
                helpers.sendJsonResponse(res, 200, token);
            }
        });
    });
});

module.exports = router;
