var mongoose = require('mongoose');

var Products = mongoose.Schema({
    title: {
        type: String,
        unique: true
    },
    category: {
        _id: Number,
        name: String
    },
    imgUrl: String,
    framework: String,
    previewUrl: String,
    dateAdded: {
        type: Date,
        default: Date.now
    },
    popularity: {
        type: Number,
        default: 0
    },
    buyDomainUrl: {
        withDomainUrl: String,
        withoutDomainUrl: String
    }
});

module.exports = mongoose.model('product', Products);
