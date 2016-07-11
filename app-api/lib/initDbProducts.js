/*
1. Parse the data from the file
2. For each parsed object, create a product object
3. Insert each product created
OR
3. Save each product create in a array
4. Insert all of the products from array
*/
'user strict';

var path = require('path');
var jsonfile = require('jsonfile');
var mongoose = require('mongoose');
var Products = require('../models/products');
var Q = require('q');
var Async = require('async');

var productsPath = path.join(__dirname, '../assets/products/products.json');
var productsArrJson;

mongoose.connect('mongodb://localhost/admin-panel-github', function(err) {
    if (err) throw err;
    console.log('Mongoose database connected!!');

    Products.remove({}, function (err) {
        if(err) {
            throw err;
        } else {
            jsonfile.readFile(productsPath, function (err, products) {
                Async.each(products, function (value, callback) {
                    var product = new Products();
                    product.title = value.title;
                    product.category = {
                        _id: value.category._id,
                        name: value.category.name
                    };
                    product.framework = value.framework;
                    product.imgUrl = value.imgUrl;
                    product.popularity = value.popularity;
                    product.previewUrl = value.previewUrl;
                    product.buyDomainUrl = {
                        withDomainUrl: value.buyDomainUrl.withDomainUrl,
                        withoutDomainUrl: value.buyDomainUrl.withoutDomainUrl
                    };
                    product.isVisible = value.isVisible;

                    product.save(function (err) {
                        if(err) {
                            callback(err);
                        } else {
                            callback();
                        }
                    });
                }, function (err) {
                    if(err) {
                        throw err
                    } else {
                        console.log('Initializing Products collection done!!!!');
                        mongoose.connection.close(function(err) {
                            if (err) {
                                throw err;
                            }
                            console.log("Collection inserted and close db connection");
                        });
                    }
                });
            });
        }
    });
});
