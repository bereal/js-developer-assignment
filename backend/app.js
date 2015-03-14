var express = require('express');
var bodyParser = require('body-parser');
var serverbone = require('serverbone');
var collections = require('./collections');
var config = require('./config');

var usersResource = new serverbone.resources.Resource('users', {
  collection: collections.Users
});

var default_actor = {
  get: function(name) {
      return name === 'roles' ? [] : null;
  }
};

var app = express();
app.use('/ui', express.static(__dirname + '/../frontend/build'));
app.use(bodyParser());
app.use(function (req, res, next) {
    req.actor = default_actor; next();
});
app.use('/users', usersResource.app);

app.listen(config.listen_port);
console.log('listening in port:' + config.listen_port);
