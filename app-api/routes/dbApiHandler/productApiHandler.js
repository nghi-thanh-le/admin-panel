var path = require('path');
var fs = require('fs');
var multer = require('multer');
var helpers = require('../lib/helpers');

var Products = require('../models/products');

var pathForUploadPic = path.join(__dirname, '../../public/img/products');

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

var getProducts = function (req, res) {
    Products.find({}, {
        title: 1,
        category: 1,
        imgUrl: 1,
        framework: 1,
        previewUrl: 1,
        dateAdded: 1,
        popularity: 1,
        buyDomainUrl: 1
    }, function(err, products) {
        if (err) {
            return helpers.sendJsonResponse(res, 400, err);
        }
        helpers.sendJsonResponse(res, 200, products);
    });
};

var getProductsByTitle = function (req, res) {
    var productTitle = req.params.productTitle;
    if (!productTitle) {
        return helpers.sendJsonResponse(res, 400, {
            message: 'Product title not found'
        });
    }
    Products.findOne({
        title: productTitle
    }, {
        title: 1,
        category: 1,
        imgUrl: 1,
        framework: 1,
        previewUrl: 1,
        dateAdded: 1,
        popularity: 1,
        buyDomainUrl: 1
    }, function(err, product) {
        if (err || !product) {
            return helpers.sendJsonResponse(res, 404, {
                message: 'Product not found'
            });
        }
        helpers.sendJsonResponse(res, 200, product);
    });
};

var addProduct = function (req, res) {
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
};

var editProductWithStringInput = function (req, res) {
    helpers.handlingEdit(Products, 'Product', req, res, function (product, response) {
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
};

var editProductWithObjectInput = function (req, res) {
    upload(req, res, function (err) {
        if(err) {
            return helpers.sendJsonResponse(res, 400, err);
        }

        helpers.handlingEdit(Products, 'Product', req, res, function (product, response) {
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
};

var deleteProduct = function (req, res) {
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
}

module.exports = {
    getProducts: getProducts,
    getProductsByTitle: getProductsByTitle,
    addProduct: addProduct,
    editProductWithStringInput: editProductWithStringInput,
    editProductWithObjectInput: editProductWithObjectInput,
    deleteProduct: deleteProduct
}
