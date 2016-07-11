var mongoose = require('mongoose');

var References = mongoose.Schema({
    title: {
        type: String,
        unique: true
    },
    name: String,
    picture: String,
    legend: String,
    description: String,
    technology: String,
    framework: String,
    link: String,
    category: {
        _id: Number,
        name: String
    },
    isVisible: Boolean
});

module.exports = mongoose.model('reference', References);
