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
var fs = require('fs');
var mongoose = require('mongoose');
var Products = require('../models/products');
var Q = require('q');

var productsPath = path.join(__dirname, '../models/products.json');
var productsArrJson;

mongoose.connect('mongodb://localhost/admin-panel', function(err) {
    if (err) throw err;
    console.log('Mongoose database connected!!');

    Products.remove({}, function (err) {
        if(err) throw err;
        fs.readFile(productsPath, 'utf8', function(err, obj) {
            var promises = [];
            productsArrJson = JSON.parse(obj);
            productsArrJson.forEach(function(value) {
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

                promises.push(product.save());
            });
            Q.all(promises).then(value => {
                console.log("Initialize products collection");
                mongoose.connection.close(function(err) {
                    if (err) {
                        throw err;
                    }

                    console.log("Collections inserted and close db connection");
                });
            }).catch(err => {
                throw err;
            });
        });
    });
});