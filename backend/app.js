var express = require('express');
var bodyParser = require('body-parser');
var serverbone = require('serverbone');
var collections = require('./collections');
var models = require('./models');
var config = require('./config');

var usersResource = new serverbone.resources.Resource('users', {
  collection: collections.Users
});

var app = express();
app.use('/ui', express.static(__dirname + '/../frontend/build'));
app.use(bodyParser());
app.use(function (req, res, next) {
    req.actor = new models.User();
    next();
});
app.use('/users', usersResource.app);

app.listen(config.listen_port);
console.log('listening in port:' + config.listen_port);
