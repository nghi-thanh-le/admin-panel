var path = require('path');
var fs = require('fs');
var multer = require('multer');
var helpers = require('../../lib/helpers');
var _ = require('lodash');
var util = require('util');
var jsonfile = require('jsonfile');
var Async = require('async');

jsonfile.spaces = 4;

var pathForReferenceJson = path.join(__dirname, '../../assets/references/references.json');
var pathForCategories = path.join(__dirname, '../assets/categories/categories.json');
var pathForUploadPic = path.join(__dirname, '../../../public/img/references');

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

var getReferences = function(req, res) {
    jsonfile.readFile(pathForReferenceJson, function(err, references) {
        if (err) {
            return helpers.sendJsonResponse(res, 404, err);
        }
        helpers.sendJsonResponse(res, 200, references);
    });
};

var getReferenceByTitle = function(req, res) {
    var title = decodeURI(req.params.title);
    if (util.isNullOrUndefined(title)) {
        return helpers.sendJsonResponse(res, 400, 'Bad request');
    }

    jsonfile.readFile(pathForReferenceJson, function(err, references) {
        if (err) {
            return helpers.sendJsonResponse(res, 404, err);
        }
        for (var i = 0; i < references.length; i++) {
            if (references[i].title == title) {
                helpers.sendJsonResponse(res, 200, references[i]);
                break;
            }
        }
    });
};

var addReference = function(req, res) {
    upload(req, res, function(err) {
        if (err) {
            return helpers.sendJsonResponse(res, 400, err);
        }

        var reference = {
            title: req.body.title,
            name: req.body.name,
            picture: req.file.originalname,
            legend: req.body.legend,
            description: req.body.description,
            technology: req.body.technology,
            framework: req.body.framework,
            link: req.body.link,
            category: {
                _id: helpers._idForCategory(req.body.category),
                name: req.body.category
            }
        };
        jsonfile.readFile(pathForReferenceJson, function(err, references) {
            if (err) {
                return helpers.sendJsonResponse(res, 400, err);
            }
            references.push(reference);
            jsonfile.writeFile(pathForReferenceJson, references, function(err) {
                if (err) {
                    return helpers.sendJsonResponse(res, 400, err);
                }
                delete req.file;
                helpers.sendJsonResponse(res, 201, 'Saved successfully');
            });
        });
    });
};

var editReferenceWithStringInput = function(req, res) {
    // there is no picture to upload, heh!!
    var post = req.body;
    var titleToFind = req.body.oldTitle ? req.body.oldTitle : req.body.title;

    jsonfile.readFile(pathForReferenceJson, function(err, references) {
        if (err) {
            return helpers.sendJsonResponse(res, 400, err);
        }
        for (var i = 0; i < references.length; i++) {
            if (references[i].title == titleToFind) {
                // do 1 things
                // edit in references.json
                references[i] = undefined;
                references[i] = {
                    title: req.body.title,
                    name: req.body.name,
                    legend: req.body.legend,
                    picture: req.body.picture,
                    description: req.body.description,
                    technology: req.body.technology,
                    framework: req.body.framework,
                    link: req.body.link,
                    category: {
                        _id: helpers._idForCategory(req.body.category),
                        name: req.body.category
                    }
                };
                jsonfile.writeFile(pathForReferenceJson, references, function (err) {
                    if(err) {
                        return helpers.sendJsonResponse(res, 400, err);
                    }
                    helpers.sendJsonResponse(res, 200, 'reference edited - referenced json file rewritten');
                });
                break;
            }
        }
    });
};

var editReferenceWithObjectInput = function(req, res) {
    upload(req, res, function(err) {
        if (err) {
            return helpers.sendJsonResponse(res, 400, err);
        }

        var titleToFind = req.body.oldTitle ? req.body.oldTitle : req.body.title;

        jsonfile.readFile(pathForReferenceJson, function(err, references) {
            if (err) {
                return helpers.sendJsonResponse(res, 400, err);
            }
            for (var i = 0; i < references.length; i++) {
                if (references[i].title == titleToFind) {
                    // do 2 things
                    // first delete image
                    // second edit in references.json
                    Async.parallel([
                        function (callback) {
                            fs.unlink(path.join(pathForUploadPic, references[i].picture), function(err) {
                                if (err) {
                                    return callback(err, null);
                                }
                                delete req.file
                                callback(null, 'Image deleted');
                            });
                    }, function (callback) {
                        references[i] = undefined;
                        references[i] = {
                            title: req.body.title,
                            name: req.body.name,
                            picture: req.file.originalname,
                            legend: req.body.legend,
                            description: req.body.description,
                            technology: req.body.technology,
                            framework: req.body.framework,
                            link: req.body.link,
                            category: {
                                _id: helpers._idForCategory(req.body.category),
                                name: req.body.category
                            }
                        };
                        jsonfile.writeFile(pathForReferenceJson, references, function (err) {
                            if(err) {
                                return callback(err, null);
                            }
                            callback(null, 'reference edited - referenced json file rewritten');
                        });
                    }], function (err, results) {
                        if (err) {
                            return helpers.sendJsonResponse(res, 500, err);
                        }
                        helpers.sendJsonResponse(res, 200, results);
                    });
                    break;
                }
            }
        });
    });
};

var deleteReference = function(req, res) {
    var title = req.body.title;
    jsonfile.readFile(pathForReferenceJson, function(err, references) {
        if (err) {
            return helpers.sendJsonResponse(res, 404, err);
        }
        for (var i = 0; i < references.length; i++) {
            if (references[i].title == title) {
                // delete image
                Async.parallel([
                    function(callback) {
                        // delete image
                        fs.unlink(path.join(pathForUploadPic, references[i].picture), function(err) {
                            if (err) {
                                return callback(err, null);
                            }
                            callback(null, 'image deleted');
                        });
                    },
                    function(callback) {
                        // remove reference
                        references.splice(i, 1);
                        jsonfile.writeFile(pathForReferenceJson, references, function(err) {
                            if (err) {
                                return callback(err, null);
                            }
                            callback(null, 'references json rewritten');
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
    getReferences: getReferences,
    getReferenceByTitle: getReferenceByTitle,
    addReference: addReference,
    editReferenceWithStringInput: editReferenceWithStringInput,
    editReferenceWithObjectInput: editReferenceWithObjectInput,
    deleteReference: deleteReference
}
