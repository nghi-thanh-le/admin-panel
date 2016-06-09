var mongoose = require('mongoose');
var fs = require('fs');
var path = require('path');
var Q = require('q');

var pathForUploadPic = path.join(__dirname, '../../public/img');

var buyDomainUrl = mongoose.Schema({
    withDomainUrl: {
        type: String,
        default: 'withDomainUrl'
    },
    withoutDomainUrl: {
        type: String,
        default: 'withoutDomainUrl'
    },
}, {
    _id: false
});

var Categories = mongoose.Schema({
    _id: Number,
    name: String
}, {
    _id: false
});

var Products = mongoose.Schema({
    title: {
        type: String,
        unique: true
    },
    category: Categories,
    imgUrl: {
        type: String,
        default: 'https://placehold.it/200x200'
    },
    framework: String,
    previewUrl: {
        type: String,
        default: 'http://example.com/'
    },
    dateAdded: {
        type: Date,
        default: Date.now
    },
    popularity: {
        type: Number,
        default: 5
    },
    buyDomainUrl: {
        type: buyDomainUrl,
        default: buyDomainUrl
    }
});

Products.method('handleImgUpload', function(imgUploadFile) {
    var defer = Q.defer();

    var oldPath = path.normalize(imgUploadFile.path);
    var originalname = imgUploadFile.originalname;
    var newPath = path.join(pathForUploadPic, originalname);
    // if slice before newPath, filename will be originalname without suffix
    // unable to regconize type.....
    originalname = originalname.slice(0, originalname.indexOf('.'));

    fs.rename(oldPath, newPath, function(err) {
        if (err) {
            defer.reject(err);
        }

        defer.resolve();
    });
    return defer.promise;
});

module.exports = {
    Products: mongoose.model('product', Products),
    Categories: mongoose.model('categories', Categories, 'categories')
};
