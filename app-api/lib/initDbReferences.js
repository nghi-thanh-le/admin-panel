/*
1. Parse the data from the file
2. For each parsed object, create a reference object
3. Insert each reference created
OR
3. Save each reference create in a array
4. Insert all of the references from array
*/
'user strict';

var path = require('path');
var fs = require('fs');
var mongoose = require('mongoose');
var References = require('../models/references');
var Q = require('q');
var _ = require('lodash')

var referencesPath = path.join(__dirname, '../models/references.json');
var referencesArrJson;

mongoose.connect('mongodb://localhost/admin-panel', function(err) {
    if (err) throw err;
    console.log('Mongoose database connected!!');

    console.log("Start to initlize references");
    References.remove({}, function(err) {
        if (err) throw err;
        fs.readFile(referencesPath, 'utf8', function(err, references) {
            var promises = [];
            referencesArrJson = JSON.parse(references);

            _.forEach(referencesArrJson, function (value) {
                var reference = new References();

                reference.title = value.title;
                reference.name = value.name;
                reference.picture = value.picture;
                reference.legend = value.legend;
                reference.description = value.description;
                reference.technology = value.technology;
                reference.framework = value.framework;
                reference.link = value.link;
                reference.category = {
                    _id: value.category._id,
                    name: value.category.name
                };

                promises.push(reference.save());
            });
            Q.all(promises).then(value => {
                console.log("Initialize references collection");
                mongoose.connection.close(function(err) {
                    if (err) {
                        throw err;
                    }
                    console.log("Collection inserted and close db connection");
                });
            }).catch(err => {
                console.error(err);
                process.exit();
            });
        });
    });
});
