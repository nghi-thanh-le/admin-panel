/*
                                    _ooOoo_
                                   o8888888o
                                   88" . "88
                                   (| -_- |)
                                    O\ = /O
                                ____/`---'\____
                              .   ' \\| |// `.
                               / \\||| : |||// \
                             / _||||| -:- |||||- \
                               | | \\\ - /// | |
                             | \_| ''\---/'' | |
                              \ .-\__ `-` ___/-. /
                           ___`. .' /--.--\ `. . __
                        ."" '< `.___\_<|>_/___.' >'"".
                       | | : `- \`.;`\ _ /`;.`/ - ` : | |
                         \ \ `-. \_ __\ /__ _/ .-` / /
                 ======`-.____`-.___\_____/___.-`____.-'======
                                    `=---='
                 .............................................
                      My code is gonna make you cry so hard
                      May the Buddha be with you  ◉︵◉
*/
var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');
var api = require('./app-api/routes/api');
var db = require('./app-api/models/db');
var index = require('./app-server/routes/index');

var app = express();

db();

app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));

app.use('/api', api);
app.use('/', index);

module.exports = app;
