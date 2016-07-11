var path = require('path');
var jsonfile = require('jsonfile');
var helpers = require('../../lib/helpers');
var _ = require('lodash');
var util = require('util');
var Async = require('async');

jsonfile.spaces = 4;

var pathToDashboard = path.join(__dirname, '../../assets/dashboard/main.json');

var getDashboard = function (req, res) {
    jsonfile.readFile(pathToDashboard, function (err, main) {
        if(err) {
            return helpers.sendJsonResponse(res, 500, err);
        }
        helpers.sendJsonResponse(res, 200, main);
    });
};

var addToDashboard = function (req, res) {
    var dashboard = {
        section: req.body.section,
        text: req.body.text
    };

    jsonfile.readFile(pathToDashboard, function (err, main) {
        if(err) {
            return helpers.sendJsonResponse(res, 500, err);
        }
        main.push(dashboard);
        jsonfile.writeFile(pathToDashboard, main, function (err) {
            if(err) {
                return helpers.sendJsonResponse(res, 500, err);
            }
            helpers.sendJsonResponse(res, 200, 'Add new done!');
        });
    });
};

var editDashboard = function (req, res) {
    var old_section = req.body.old_section;
    var dashboard = {
        section: req.body.section,
        text: req.body.text
    };
    jsonfile.readFile(pathToDashboard, function (err, main) {
        if(err) {
            return helpers.sendJsonResponse(res, 500, err);
        }
        var index = _.findIndex(main, function (obj) {
            return obj.section == old_section;
        });
        if(index < 0) {
            return helpers.sendJsonResponse(res, 404, 'Not found!');
        }
        main[index].section = dashboard.section;
        main[index].text = dashboard.text;
        jsonfile.writeFile(pathToDashboard, main, function (err) {
            if(err) {
                return helpers.sendJsonResponse(res, 500, err);
            }
            helpers.sendJsonResponse(res, 200, 'Edit file done!');
        });
    });
};

var deleteFromDashBoard = function (req, res) {
    var section = req.body.section;
    jsonfile.readFile(pathToDashboard, function (err, main) {
        if(err) {
            return helpers.sendJsonResponse(res, 500, err);
        }

        var index = _.findIndex(main, function (obj) {
            return obj.section == section;
        });
        if(index < 0) {
            return helpers.sendJsonResponse(res, 404, 'Not found!');
        }
        main.splice(index, 1);
        jsonfile.writeFile(pathToDashboard, main, function (err) {
            if(err) {
                return helpers.sendJsonResponse(res, 500, err);
            }
            helpers.sendJsonResponse(res, 200, 'Delete done!!!');
        });
    });
};

module.exports = {
    getDashboard: getDashboard,
    addToDashboard: addToDashboard,
    editDashboard: editDashboard,
    deleteFromDashBoard: deleteFromDashBoard
}
