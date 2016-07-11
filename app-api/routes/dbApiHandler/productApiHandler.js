var path = require('path');
var fs = require('fs');
var multer = require('multer');
var helpers = require('../../lib/helpers');
var Products = require('../../models/products.js');
var _ = require('lodash');
var util = require('util');
var Async = require('async');
var moment = require('moment');
var Q = require('q');

var pathForUploadPic = path.join(__dirname, '../../../public/img/products');

var upload = multer({
    dest: pathForUploadPic
}).single('file');

var getProducts = function(req, res) {
    Products.find({}, {
        _id: 1,
        title: 1,
        category: 1,
        imgUrl: 1,
        framework: 1,
        previewUrl: 1,
        dateAdded: 1,
        popularity: 1,
        buyDomainUrl: 1,
        isVisible: 1
    }, function(err, products) {
        if (err) {
            return helpers.sendJsonResponse(res, 400, err);
        }
        helpers.sendJsonResponse(res, 200, products);
    });
};

var getProductById = function(req, res) {
    var _id = req.params._id;
    if (!_id) {
        return helpers.sendJsonResponse(res, 400, {
            message: 'Product id not found'
        });
    }
    Products.findById(_id, {
        _id: 1,
        title: 1,
        category: 1,
        imgUrl: 1,
        framework: 1,
        previewUrl: 1,
        dateAdded: 1,
        popularity: 1,
        buyDomainUrl: 1,
        isVisible: 1
    }, function(err, product) {
        if (err || !product) {
            return helpers.sendJsonResponse(res, 404, {
                message: 'Product not found'
            });
        }
        helpers.sendJsonResponse(res, 200, product);
    });
};

var addProduct = function(req, res) {
    upload(req, res, function(err) {
        if (err) {
            return helpers.sendJsonResponse(res, 400, err);
        }

        Async.parallel([
            function(callback) {
                var product = new Products({
                    title: req.body.title,
                    framework: req.body.framework,
                    dateAdded: new Date(),
                    category: {
                        name: req.body.category,
                        _id: helpers._idForCategory(req.body.category)
                    },
                    buyDomainUrl: {
                        withDomainUrl: req.body.withDomainUrl,
                        withoutDomainUrl: req.body.withoutDomainUrl
                    },
                    popularity: req.body.popularity,
                    previewUrl: req.body.previewUrl,
                    imgUrl: helpers.imgName(req.file.mimetype, req.body.title),
                    isVisible: true
                });

                product.save(function(err, savedProduct) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, 'save new product done!');
                    }
                });
            },
            function(callback) {
                var pathForTempPic = path.join(pathForUploadPic, req.file.filename);
                var newName = path.join(pathForUploadPic, helpers.imgName(req.file.mimetype, req.body.title));

                fs.rename(pathForTempPic, newName, function(err) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, 'rename new image done!');
                    }
                });
            }
        ], function(err, results) {
            if (err) {
                return helpers.sendJsonResponse(res, 500, err);
            }
            delete req.file;
            helpers.sendJsonResponse(res, 200, results);
        });
    });
};

var editProductWithStringInput = function(req, res) {
    Products.findById(req.body._id, function(err, product) {
        if (err || !product) {
            return helpers.sendJsonResponse(res, 404, 'Not found!');
        }

        Async.series([
                function(callback) {
                    var oldName = path.join(pathForUploadPic, req.body.imgUrl);
                    var newName = path.join(pathForUploadPic, req.body.title + req.body.imgUrl.slice(req.body.imgUrl.indexOf('.')));
                    fs.rename(oldName, newName, function(err) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, 'rename old image done!');
                        }
                    });
                },
                function(callback) {
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
                    product.imgUrl = req.body.title + req.body.imgUrl.slice(req.body.imgUrl.indexOf('.'));

                    product.save(function(err) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, 'saved to database done!');
                        }
                    });
                }
            ],
            function(err, results) {
                if (err) {
                    return helpers.sendJsonResponse(res, 500, err);
                }
                helpers.sendJsonResponse(res, 200, results);
            });
    });
};

var editProductWithObjectInput = function(req, res) {
    upload(req, res, function(err) {
        if (err) {
            return helpers.sendJsonResponse(res, 400, err);
        }

        fs.readdir(pathForUploadPic, function(err, files) {
            if (err) {
                return helpers.sendJsonResponse(res, 400, err);
            }

            var index = _.findIndex(files, function(file) {
                return file == req.file.originalname;
            });
            var pathForTempPic = path.join(pathForUploadPic, req.file.filename);

            if (index >= 0) {
                fs.unlink(pathForTempPic, function(err) {
                    if (err) {
                        return helpers.sendJsonResponse(res, 500, err);
                    }
                    helpers.sendJsonResponse(res, 500, 'Duplicate filename, please rename the file before post!!!!');
                });
            } else {
                Products.findById(req.body._id, function(err, product) {
                    if (!product || err) {
                        return helpers.sendJsonResponse(res, 404, 'Product not found!');
                    }
                    Async.series([
                        function(callback) {
                            fs.unlink(path.join(pathForUploadPic, product.imgUrl), function(err) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    callback(null, 'delete old image done!');
                                }
                            });
                        },
                        function(callback) {
                            var newName = path.join(pathForUploadPic, helpers.imgName(req.file.mimetype, req.body.title));
                            fs.rename(pathForTempPic, newName, function(err) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    callback(null, 'rename new image done!');
                                }
                            });
                        },
                        function(callback) {
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
                            product.imgUrl = helpers.imgName(req.file.mimetype, req.body.title);

                            product.save(function(err) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    delete req.file;
                                    callback(null, 'saved to database done!');
                                }
                            });
                        }
                    ], function(err, results) {
                        if (err) {
                            return helpers.sendJsonResponse(res, 500, err);
                        }
                        helpers.sendJsonResponse(res, 201, results);
                    });
                });
            }
        });
    });
};

var deleteProduct = function(req, res) {
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
};

var changeVisible = function (req, res) {
    var _id = req.body._id;
    var isVisible = req.body.isVisible;
    Products.findById(_id, function (err, product) {
        if(err) {
            return helpers.sendJsonResponse(res, 500, err);
        }
        product.isVisible = isVisible;
        product.save(function (err) {
            if(err) {
                return helpers.sendJsonResponse(res, 500, err);
            }
            helpers.sendJsonResponse(res, 200, 'Visible changed!!!!');
        })
    });
};

module.exports = {
    getProducts: getProducts,
    getProductById: getProductById,
    addProduct: addProduct,
    editProductWithStringInput: editProductWithStringInput,
    editProductWithObjectInput: editProductWithObjectInput,
    deleteProduct: deleteProduct,
    changeVisible: changeVisible
}
