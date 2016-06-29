var fs = require('fs');
var path = require('path');
var helpers = require('../../lib/helpers');
var jsonfile = require('jsonfile');
var Async = require('async');
var util = require('util');

var pathForCategories = path.join(__dirname, '../../assets/categories/categories.json');
var pathForJobs = path.join(__dirname, '../../assets/jobs/jobs.json');

module.exports = {
    getCategories: function (req, res) {
        fs.readFile(pathForCategories, 'utf8', function (err, categories) {
            if(err) {
                return helpers.sendJsonResponse(res, 400, err);
            }
            categories = JSON.parse(categories);
            helpers.sendJsonResponse(res, 200, categories);
        });
    },
    getJobsGroup: function (req, res) {
        jsonfile.readFile(pathForJobs, function (err, jobs) {
            if(err) {
                return helpers.sendJsonResponse(res, 400, err);
            }
            var keys = {};
            var results = [];
            Async.forEachOf(jobs, function (job, indexInArr, callback) {
                var group = job.section_name;
                if(util.isNullOrUndefined(keys[group])) {
                    keys[group] = true;
                    results.push(group);
                }
                callback();
            }, function (err) {
                if(err) {
                    return helpers.sendJsonResponse(res, 500, err);
                }
                helpers.sendJsonResponse(res, 200, results);
            });
        });
    }
}
