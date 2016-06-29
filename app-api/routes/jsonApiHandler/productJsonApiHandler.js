var path = require('path');
var fs = require('fs');
var multer = require('multer');
var helpers = require('../../lib/helpers');
var _ = require('lodash');
var util = require('util');
var jsonfile = require('jsonfile');
var Async = require('async');
var moment = require('moment');
var Q = require('q');

jsonfile.spaces = 4;

var pathForProductJson = path.join(__dirname, '../../assets/products/products.json');
var pathForCategories = path.join(__dirname, '../assets/categories/categories.json');
var pathForUploadPic = path.join(__dirname, '../../../public/img/products');

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, pathForUploadPic);
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

var upload = multer({
    storage: storage
}).single('file');

var getProducts = function(req, res) {
    jsonfile.readFile(pathForProductJson, function(err, products) {
        if (err) {
            return helpers.sendJsonResponse(res, 404, err);
        }
        helpers.sendJsonResponse(res, 200, products);
    });
};

var getProductsByTitle = function(req, res) {
    var title = req.params.title;
    if (util.isNullOrUndefined(title)) {
        return helpers.sendJsonResponse(res, 400, {
            message: 'Product title not found'
        });
    }
    jsonfile.readFile(pathForProductJson, function(err, products) {
        if (err) {
            return helpers.sendJsonResponse(res, 400, err);
        }
        for (var i = 0; i < products.length; i++) {
            if (products[i].title == title) {
                helpers.sendJsonResponse(res, 200, products[i]);
                break;
            }
        }
    });
};

var addProduct = function(req, res) {
    // have to change the name
    upload(req, res, function(err) {
        if (err) {
            return helpers.sendJsonResponse(res, 400, err);
        }
        var post = {
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
            imgUrl: helpers.imgName(req.file.mimetype, req.body.title)
        };
        jsonfile.readFile(pathForProductJson, function(err, products) {
            if (err) {
                return helpers.sendJsonResponse(res, 400, err);
            }
            var checkInArr = _.find(products, function(product) {
                return product.title == post.title;
            });
            if (util.isNullOrUndefined(checkInArr)) {
                Async.parallel([
                    function(callback) {
                        products.push(post);
                        jsonfile.writeFile(pathForProductJson, products, function(err) {
                            if (err) {
                                return callback(err, null);
                            }
                            callback(null, 'json file added - rewritten');
                        });
                    },
                    function(callback) {
                        var oldPath = path.join(pathForUploadPic, req.file.originalname);
                        var newPath = path.join(pathForUploadPic, helpers.imgName(req.file.mimetype, req.body.title));
                        fs.rename(oldPath, newPath, function (err) {
                            if(err) {
                                return callback(err, null);
                            }
                            callback(null, 'rename image done!!!!');
                        });
                    }
                ], function(err, results) {
                    if (err) {
                        return helpers.sendJsonResponse(res, 500, err);
                    }
                    delete req.file;
                    helpers.sendJsonResponse(res, 200, results);
                });
            } else {
                fs.unlink(path.join(pathForUploadPic, helpers.imgName(req.file.originalname)), function(err) {
                    if (err) {
                        return helpers.sendJsonResponse(res, 400, err);
                    }
                    delete req.file;
                    helpers.sendJsonResponse(res, 500, 'Product exists');
                });
            }
        });
    });
};

var editProductWithStringInput = function(req, res) {
    var titleToFind = req.body.oldTitle ? req.body.oldTitle : req.body.title;
    jsonfile.readFile(pathForProductJson, function(err, products) {
        if (err) {
            return helpers.sendJsonResponse(res, 400, err);
        }
        // i = position of value in collection
        var i = _.findIndex(products, function (item) {
            return item.title == titleToFind;
        });
        if(i < 0) {
            helpers.sendJsonResponse(res, 404, 'Can not find product');
        } else {
            Async.series([
                // rename it again ofcourse
                function(callback) {
                    var oldPath = path.join(pathForUploadPic, req.body.imgUrl);
                    var newImgUrl = req.body.title + req.body.imgUrl.slice(req.body.imgUrl.indexOf('.'));
                    var newPath = path.join(pathForUploadPic, newImgUrl);
                    fs.rename(oldPath, newPath, function (err) {
                        if(err) {
                            return callback(err, null);
                        }
                        callback(null, 'rename image done!!!!');
                    });
                },
                function(callback) {
                    // write to products.json
                    products[i] = undefined;
                    products[i] = {
                        title: req.body.title,
                        framework: req.body.framework,
                        dateAdded: moment(req.body),
                        dateAdded: new Date(req.body.dateAdded),
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
                        imgUrl: req.body.title + req.body.imgUrl.slice(req.body.imgUrl.indexOf('.'))
                    };
                    jsonfile.writeFile(pathForProductJson, products, function(err) {
                        if (err) {
                            return callback(err, null);
                        }
                        callback(null, 'product edited - product json file rewritten');
                    });
                }
            ], function(err, results) {
                if (err) {
                    return helpers.sendJsonResponse(res, 500, err);
                }
                helpers.sendJsonResponse(res, 200, results);
            });
        }
    });
};

var editProductWithObjectInput = function(req, res) {
    upload(req, res, function(err) {
        if (err) {
            return helpers.sendJsonResponse(res, 400, err);
        }

        var titleToFind = req.body.oldTitle ? req.body.oldTitle : req.body.title;

        jsonfile.readFile(pathForProductJson, function(err, products) {
            if (err) {
                return helpers.sendJsonResponse(res, 400, err);
            }
            for (var i = 0; i < products.length; i++) {
                if (products[i].title == titleToFind) {
                    Async.parallel([
                        function(callback) {
                            // delete the freaking picture
                            fs.unlink(path.join(pathForUploadPic, products[i].imgUrl), function(err) {
                                if (err) {
                                    return callback(err, null);
                                }
                                callback(null, 'Existing image deleted');
                            });
                        },
                        function(callback) {
                            // write to products.json
                            products[i] = undefined;
                            products[i] = {
                                title: req.body.title,
                                framework: req.body.framework,
                                dateAdded: new Date(req.body.dateAdded),
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
                                imgUrl: helpers.imgName(req.file.mimetype, req.body.title)
                            };
                            jsonfile.writeFile(pathForProductJson, products, function(err) {
                                if (err) {
                                    return callback(err, null);
                                }
                                callback(null, 'product edited - product json file rewritten');
                            });
                        },
                        // rename it again ofcourse
                        function(callback) {
                            var oldPath = path.join(pathForUploadPic, req.file.originalname);
                            var newPath = path.join(pathForUploadPic, helpers.imgName(req.file.mimetype, req.body.title));
                            fs.rename(oldPath, newPath, function (err) {
                                if(err) {
                                    return callback(err, null);
                                }
                                callback(null, 'rename image done!!!!');
                            });
                        }
                    ], function(err, results) {
                        if (err) {
                            return helpers.sendJsonResponse(res, 500, err);
                        }
                        delete req.file;
                        helpers.sendJsonResponse(res, 200, results);
                    });
                    break;
                }
            }
        });
    });
};

var deleteProduct = function(req, res) {
    var title = req.body.title;
    jsonfile.readFile(pathForProductJson, function(err, products) {
        if (err) {
            return helpers.sendJsonResponse(res, 404, err);
        }
        for (var i = 0; i < products.length; i++) {
            if (products[i].title == title) {
                // delete image
                Async.parallel([
                    function(callback) {
                        // delete image
                        fs.unlink(path.join(pathForUploadPic, products[i].imgUrl), function(err) {
                            if (err) {
                                return callback(err, null);
                            }
                            callback(null, 'image deleted');
                        });
                    },
                    function(callback) {
                        // remove reference
                        products.splice(i, 1);
                        jsonfile.writeFile(pathForProductJson, products, function(err) {
                            if (err) {
                                return callback(err, null);
                            }
                            callback(null, 'products json rewritten');
                        })
                    }
                ], function(err, results) {
                    if (err) {
                        return helpers.sendJsonResponse(res, 500, err);
                    }
                    helpers.sendJsonResponse(res, 200, results);
                });
                break;
            }
        }
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
