var fs = require('fs');
var path = require('path');
var helpers = require('../lib/helpers');

var pathForCategories = path.join(__dirname, '../models/categories.json');

module.exports = {
    getCategories: function (req, res) {
        fs.readFile(pathForCategories, 'utf8', function (err, categories) {
            if(err) {
                return helpers.sendJsonResponse(res, 400, err);
            }
            categories = JSON.parse(categories);
            helpers.sendJsonResponse(res, 200, categories);
        });
    }
}
