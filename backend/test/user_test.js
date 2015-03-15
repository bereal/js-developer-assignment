var models = require('../models');
var collections = require('../collections');
var should = require('chai').should();

describe('User tests', function() {
  var user;

  it('should add roles to User', function() {
    var usr = new models.User();
    usr.addRoles('a');
    usr.get('roles').length.should.equal(1);
    usr.get('roles').should.contain('a');
    usr.addRoles('a', 'b');
    usr.get('roles').length.should.equal(2);
    usr.get('roles').should.contain('b');
    usr.addRoles(['c', 'd']);
    usr.get('roles').length.should.equal(4);
    usr.get('roles').should.contain('d');
    usr.addRoles('e', ['f', 'd'], 'h');
    usr.get('roles').length.should.equal(7);
  });

  it('should save a User', function() {
    user = new models.User({
      username: 'foouser',
      password: 'supersecRet',
      description: 'hello world'
    });
    return user.save();
  });

  it('plaintext password should not be saved', function() {
    return user
      .fetch()
      .then(function() {
        user.get('password').should.not.equal('supersecRet');
        user.get('salt').should.have.length(models.User.SALT_LENGTH);
      });
  });

  it('should be possible to check password', function() {
    return user
      .fetch()
      .then(function() {
        user.checkPassword('supersecRet');
      });
  });

  it('should reject empty password', function() {
      var err = user.customValidation({username: 'name', password:''})
      err.message.toLowerCase().should.include('password');
  });

  it('should reject empty username', function() {
      var err = user.customValidation({username: '', password: 'secret'});
      err.message.toLowerCase().should.include('username');
  });

  it('should reject owner role', function() {
      var err = user.customValidation({username: 'user', password: 'secret',
                                       roles: ['owner']});
      err.message.toLowerCase().should.include('owner');
  });

  it('should list users', function() {
    var users = new collections.Users();
    return users
      .fetch()
      .then(function() {
        users.length.should.equal(1);
      });
  });
});
