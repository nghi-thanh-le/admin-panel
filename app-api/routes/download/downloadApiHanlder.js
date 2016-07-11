var path = require('path');
var fs = require('fs');
var fse = require('fs-extra');
var jsonfile = require('jsonfile');
var helpers = require('../../lib/helpers');
var _ = require('lodash');
var Async = require('async');
var multer = require('multer');
var util = require('util');
var Products = require('../../models/products');

jsonfile.spaces = 4;

var downloadProducts = function (req, res) {
    Async.waterfall([
        function (callback) {
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
            }, function (err, products) {
                if(err) {
                    callback(err, null);
                } else {
                    callback(null, products);
                }
            });
        },
        function (products, callback) {
            var pathToProducts = path.join(__dirname, '../../assets/products/products.json');
            jsonfile.writeFile(pathToProducts, products, function (err) {
                if(err) {
                    callback(err, null);
                } else {
                    callback(null, pathToProducts);
                }
            })
        }
    ], function (err, pathToRead) {
        if(err) {
            return helpers.sendJsonResponse(res, 500, err);
        };
        var downloadName = 'products.json';
        res.download(pathToRead, downloadName, function (err) {
            if(err) {
                return helpers.sendJsonResponse(res, 500, err);
            }
        });
    });
};

var downloadReferences = function (req, res) {
    var pathToReference = path.join(__dirname, '../../assets/references/references.json');
    var downloadName = 'references.json';
    res.download(pathToReference, downloadName, function (err) {
        if(err) {
            return helpers.sendJsonResponse(res, 500, err);
        }
    });
}

var downloadJobs = function (req, res) {
    var pathToJobs = path.join(__dirname, '../../assets/jobs/jobs.json');
    res.download(pathToJobs, 'jobs.json', function (err) {
        if(err) {
            return helpers.sendJsonResponse(res, 500, err);
        }
    })
};

var downloadSpecificJob = function (req, res) {
    var section_id = req.params.section_id;
    var jsonfile = req.params.jsonfile;
    var pathToFile = path.join(__dirname, '../../assets/jobs/jobPositions', section_id, jsonfile) + '.json'
    var downloadName = jsonfile + '.json';
    res.download(pathToFile, downloadName, function (err) {
        if(err) {
            return helpers.sendJsonResponse(res, 500, err);
        }
    });
};

module.exports = {
    downloadProducts: downloadProducts,
    downloadReferences: downloadReferences,
    downloadJobs: downloadJobs,
    downloadSpecificJob: downloadSpecificJob
}
