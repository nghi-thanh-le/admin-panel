var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var adminUser = require('../models/adminUser');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');
var TokenAuth = require('./TokenAuth');
var app = express();
var fs = require('fs');
var multer = require('multer');
var Q = require('q');
var util = require('util');

var MongooseModal = require('../models/modal');
var Products = MongooseModal.Products;
var Categories = MongooseModal.Categories;

var secretKey = 'abcdefghijklmn0123456789';
var pathForUploadPic = path.join(__dirname, '../../public/img');
var upload = multer({
    dest: pathForUploadPic
});

var sendJsonResponse = function(res, status, jsonObj) {
    res.status(status);
    res.json(jsonObj);
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
}

/* User Routes. */
router.get('/products', function(req, res) {
    Products.find({}, function(err, products) {
        if (err) {
            sendJsonResponse(res, 404, {
                message: 'Products list not found'
            });
        }
        sendJsonResponse(res, 200, products);
    })
});

router.get('/product/:productTitle', function(req, res) {
    var productTitle = req.params.productTitle;
    if (util.isNullOrUndefined(productTitle)) {
        sendJsonResponse(res, 500, {
            message: 'Empty produc title'
        });
    } else {
        Products.findOne({
            title: productTitle
        }, function(err, product) {
            if (err) {
                sendJsonResponse(res, 404, {
                    message: 'Product not found'
                });
            }
            sendJsonResponse(res, 200, product);
        });
    }
});

router.get('/categoryList', function(req, res) {
    Categories.find({}, function(err, category) {
        if (err) throw err;
        sendJsonResponse(res, 200, category);
    });
});

router.post('/addProduct', upload.single('file'), function(req, res) {
    var post = {
        title: req.body.title,
        category: req.body.category,
        framework: req.body.framework,
    };

    var product = new Products();
    product.title = post.title;
    product.category = {
        _id: _idForCategory(post.category),
        name: post.category
    };
    product.framework = post.framework;
    product.imgUrl = req.file.originalname;

    product.handleImgUpload(req.file).then(function() {
        product.save(function(err, savedProduct) {
            if (err) {
                sendJsonResponse(res, 401, err);
            }
            delete req.file;
            sendJsonResponse(res, 200, savedProduct);
        }, function(err) {
            sendJsonResponse(res, 500, err);
        });
    });
});

router.post('/editProduct', upload.single('file'), function(req, res) {
    Products.findById({
        _id: req.body._id
    }, function(err, product) {
        if (err || !product) {
            sendJsonResponse(res, 500, {
                message: 'Product not found'
            });
        }

        product.title = req.body.title;
        product.category = {
            _id: _idForCategory(req.body.category),
            name: req.body.category
        };
        product.framework = req.body.framework;

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
                    sendJsonResponse(res, 200, product);
                });
            });
        } else {
            product.save(function(err) {
                if (err) {
                    throw err;
                }
                sendJsonResponse(res, 200, product);
            });
        }
    });
});

router.post('/uploadPicture', upload.single('file'), function(req, res) {
    if(!req.file) {
        return sendJsonResponse(res, 500, {
            message: 'Unable to saved empty image'
        });
    }
    
    Products.findById({
        _id: req.body._id
    }, function(err, product) {
        if (err || !product) {
            sendJsonResponse(res, 404, {
                message: 'Product not found'
            });
        }
        // replace the old img file....
        fs.unlink(path.join(pathForUploadPic, product.imgUrl), function(err) {
            if (err) {
                throw err;
            }
            product.handleImgUpload(req.file).then(function(imgName) {
                product.imgUrl = req.file.originalname;
                delete req.file;
                product.save(function(err) {
                    if (err) {
                        throw err;
                    }
                    sendJsonResponse(res, 200, product);
                });
            });
        });
    });
});

router.get('/delete/:_id', function(req, res) {
    Products.findByIdAndRemove(req.params._id, function(err, product) {
        if (err) {
            throw err;
        }

        fs.unlink(path.join(pathForUploadPic, product.imgUrl), function(err) {
            if (err) {
                throw err;
            }
            sendJsonResponse(res, 200, null);
        });
    });
});

// router.post('/createUser', function (req, res) {
//     adminUser.findOne({
//         username: req.body.username
//     }, function (err, user) {
//         if(err) {
//             return sendJsonResponse(res, 401, {message: "Error occur " + err});
//         }
//         if(user) {
//             return sendJsonResponse(res, 401, {message: "User already exists!"});
//         } else {
//             var AdminUser = new adminUser();
//             var salt, hash, password;
//             password = req.body.password;
//             salt = bcrypt.genSaltSync(10);
//             hash = bcrypt.hashSync(password, salt);
//
//             AdminUser.username = req.body.username;
//             AdminUser.password = hash;
//             AdminUser.save(function (err, user) {
//                 sendJsonResponse(res, 200, TokenAuth.generateToken(user._id));
//             });
//         }
//     })
// });
//
// router.post('/login', function (req, res) {
//     var username = req.body.username;
//     var password = req.body.password;
//
//     adminUser.findOne({
//         username: username
//     }, function (err, data) {
//         if (err | data === null) {
//             return sendJsonResponse(res, 404, { message: "User not found"});
//         } else {
//             var user = data;
//             if(username === user.username && bcrypt.compareSync(password, user.password)) {
//                 return sendJsonResponse(res, 200, TokenAuth.generateToken(user._id));
//             } else {
//                 return sendJsonResponse(res, 401, {message: 'Bad username or password'});
//             }
//         }
//     });
// });
//
// router.get('/logout', function(req, res) {
//     sendJsonResponse(res, 401, {message: 'User logged out'});
// });

module.exports = router;