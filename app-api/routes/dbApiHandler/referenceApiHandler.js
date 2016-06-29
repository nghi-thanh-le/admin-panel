var path = require('path');
var fs = require('fs');
var multer = require('multer');
var helpers = require('../lib/helpers');
var _ = require('lodash');
var util = require('util');

var References = require('../models/references');

var pathForUploadPic = path.join(__dirname, '../../public/img/references');

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
    References.find({}, function (err, references) {
        if(err) {
            return helpers.sendJsonResponse(res, 400, err);
        }
        helpers.sendJsonResponse(res, 200, references);
    });
};

var getReferencesByCategory = function (req, res) {
    var category = req.params.category;
    if(util.isNullOrUndefined(category)) {
        return helpers.sendJsonResponse(res, 400, 'Bad request');
    }

    References.find({
        'category.name' : category
    }, function (err, references) {
        if(err) {
            return helpers.sendJsonResponse(res, 400, err);
        }
        helpers.sendJsonResponse(res, 200, references);
    });
};

var getReferenceById = function (req, res) {
    var _id = req.params._id;
    References.findById(_id, function (err, reference) {
        if(err || !reference) {
            return helpers.sendJsonResponse(res, 404, err);
        }
        helpers.sendJsonResponse(res, 200, reference);
    });
};

var addReference = function (req, res) {
    upload(req, res, function (err) {
        if(err) {
            return helpers.sendJsonResponse(res, 400, err);
        }

        var reference = new References({
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
        });
        reference.save(function(err, savedReference) {
            if (err) {
                return helpers.sendJsonResponse(res, 400, err);
            }
            delete req.file;
            helpers.sendJsonResponse(res, 201, savedReference);
        });
    });
};

var editReferenceWithStringInput = function (req, res) {
    helpers.handlingEdit(References, 'Reference', req, res, function (reference, response) {
        reference.save(function(err, savedReference) {
            if (err) {
                return helpers.sendJsonResponse(response, 400, err);
            }
            helpers.sendJsonResponse(response, 200, savedReference);
        });
    });
};

var editReferenceWithObjectInput = function (req, res) {
    upload(req, res, function (err) {
        if(err) {
            return helpers.sendJsonResponse(res, 400, err);
        }

        helpers.handlingEdit(References, 'Reference', req, res, function (reference, response) {
            fs.unlink(path.join(pathForUploadPic, reference.picture), function(err) {
                if (err) {
                    return helpers.sendJsonResponse(response, 400, err);
                }
                reference.picture = req.file.originalname;
                delete req.file;
                reference.save(function(err, savedReference) {
                    if (err) {
                        return helpers.sendJsonResponse(response, 400, err);
                    }
                    helpers.sendJsonResponse(response, 200, savedReference);
                });
            });
        });
    });
};

var deleteReference = function (req, res) {
    References.findByIdAndRemove(req.body._id, function(err, reference) {
        if (err || !reference) {
            return helpers.sendJsonResponse(res, 404, err);
        }

        fs.unlink(path.join(pathForUploadPic, reference.picture), function(err) {
            if (err) {
                return helpers.sendJsonResponse(res, 400, err);
            }
            helpers.sendJsonResponse(res, 200, {
                message: 'Reference deleted'
            });
        });
    });
}

module.exports = {
    getReferences: getReferences,
    getReferencesByCategory: getReferencesByCategory,
    getReferenceById: getReferenceById,
    addReference: addReference,
    editReferenceWithStringInput: editReferenceWithStringInput,
    editReferenceWithObjectInput: editReferenceWithObjectInput,
    deleteReference: deleteReference
}
