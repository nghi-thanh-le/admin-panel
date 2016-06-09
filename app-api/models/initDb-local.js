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
var MongooseModal = require('./modal');
var Products = MongooseModal.Products;
var Categories = MongooseModal.Categories;
var Q = require('q');

var productsPath = path.join(__dirname, './products.json');
var categoriesPath = path.join(__dirname, './categories.json');
var productsArrJson, categoriesArrJson;

mongoose.connect('mongodb://localhost:27017/test', function(err) {
    if (err) throw err;
    console.log('Mongoose database connected!!');
}).then(function() {
    mongoose.connection.db.dropCollection('categories', function(err) {
        if (err) {
            throw err;
        }
        console.log('Drop categories collection');
        fs.readFile(categoriesPath, 'utf8', function(err, obj) {
            var promises = [];
            categoriesArrJson = JSON.parse(obj);
            categoriesArrJson.forEach(function(value) {
                var category = new Categories();

                category._id = value._id;
                category.name = value.name;

                promises.push(category.save());
            });
            Q.all(promises).then(value => {
                mongoose.connection.db.dropCollection('products', function (err) {
                    if(err) {
                        throw err;
                    }
                    console.log('Drop products collection');
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

                            promises.push(product.save());
                        });
                        Q.all(promises).then(value => {
                            console.log("Initialize products collection");
                            mongoose.connection.close(function(err) {
                                if (err) {
                                    throw err;
                                }

                                console.log("Collections inserted and close db connection");

                                process.exit(0);
                            });
                        }).catch(err => {
                            console.log(err);
                            res.status(500).send(err);
                        });
                    });
                })
            }).catch(err => {
                console.log(err);
                res.status(500).send(err);
            });
        });
    });
});
