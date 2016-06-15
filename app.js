var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors');
var index = require('./app-server/routes/index');
var api = require('./app-api/routes/api');

mongoose.connect('mongodb://localhost:27017/admin-panel-github', function (err) {
    if (err) throw err;
    console.log('Mongoose database connected!!');
});

var app = express();

app.use(logger('short'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));

app.use('/api', api);
app.use('/', index);

module.exports = app;
