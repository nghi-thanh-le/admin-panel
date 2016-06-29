/*
1. Parse the data from the file
2. For each parsed object, create a product object
3. Insert each product created
OR
3. Save each product create in a array
4. Insert all of the products from array
*/
'user strict';

var mongoose = require('mongoose');
var Admin = require('../models/admin');
var util = require('util');

mongoose.connect('mongodb://localhost/admin-panel', function(err) {
    if (err) throw err;
    console.log('Mongoose database connected!!');

    Admin.findOne({
        username: 'admin'
    }, function(err, result) {
        if (err) {
            throw err;
        } else if (util.isNullOrUndefined(result)) {
            console.log("Admin collection is empty! Create new!!");
            var admin = new Admin();
            admin.hashedPassword('admin', function(err, hashedPassword) {
                if (err) {
                    throw err;
                }
                admin.username = 'admin';
                admin.password = hashedPassword;
                admin.save(function(err) {
                    if (err) {
                        throw err;
                    }
                    console.log("Admin initialized");
                    mongoose.connection.close(function(err) {
                        if (err) {
                            throw err;
                        }
                        console.log('Exit immigration');
                    });
                });
            });
        } else {
            console.log("Existing admin user");
            mongoose.connection.close(function(err) {
                if (err) {
                    throw err;
                }
                console.log('Exit immigration');
            });
        }
    });
});
