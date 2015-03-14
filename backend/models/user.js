var crypto = require('crypto');
var deasync = require('deasync');
var serverbone = require('serverbone');
var _ = require('underscore');
var config = require('../config');

var schema = {
  id: 'schema/user',
  type: 'object',
  indexes: [{property: 'username'}],
  permissions: {
      '*': ['create', 'read'],
      'admin': ['*'],
      'owner': ['*']
  },
  properties: {
    id: {
      type: 'integer'
    },
    username: {
      type: 'string'
    },
    password: {
      type: 'string',
      permissions: { '*': [], admin: ['update'], owner: ['update'] }
    },
    salt: {
      type: 'string',
      permissions: { '*': [], admin: [], owner: [] }
    },
    roles: {
      type: 'array',
      default: []
    }
  }
};

var User = serverbone.models.ACLModel.extend({
  schema: schema,
  type: 'user',
  db: config.store,
  sync: function(method, model, options) {
    if (method === 'create' || method === 'update') {
      var hash = User.hashPassword(model.attributes.password);
      model.attributes.salt = hash.salt;
      model.attributes.password = hash.digest;
    }
    config.store.sync(method, model, options);
  },

  /**
   * checkPassword
   *
   * This function should be implemented.
   * @returns {Boolean} true if password was correct, false if not
   */
  checkPassword: function(password) {
    var hash = User.hashPassword(password, this.get('salt'));
    return hash.digest == this.get('password');
  },

  /**
   * addRoles
   *
   * This function should be implemented.
   *
   * Roles are unique, thus adding same role twice should not add it to roles twice.
   * Usage:
   * addRoles('a') -> adds role 'a'
   * addRoles('b', 'c') -> adds roles 'b' & 'c'
   * addRoles(['c', 'd', 'e']) -> adds roles 'd' & 'e'
   */
   addRoles: function() {
     var orig = this.get('roles');
     var roles = [this.get('roles')];
     Array.prototype.slice.call(arguments).forEach(function (item) {
       if (item)
         roles.push(_.isArray(item) ? item : [item]);
     });
     this.set('roles', _.union.apply(undefined, roles));
   },

   customValidation: function(attrs, options) {
     // TODO: get rid of deasync?

     var findAll = deasync(this.db.findAll.bind(this.db));

     try {
       var data = findAll(this, {limit: 1});
       if (data && data.id !== attrs.id) {
         return {message: 'Username ' + attrs.username + ' is already taken'};
       }
     } catch (err) {
       // OK
     }
   },

   getRoles: function(model) {
     var roles = model.get('roles') || [];
     if (model.get('id') === this.get('id')) roles.push('owner');
     return roles;
    }
}, {
  // static:

  SALT_LENGTH: 16,
  genSalt: function(length) {
    length = length || User.SALT_LENGTH;
    var salt = '';
    while (salt.length < length) {
      salt +=  Math.random().toString(36).slice(2);
    }
    return salt.slice(0, length);
  },

  hashPassword: function(password, salt) {
    salt = salt || User.genSalt();
    var hash = crypto.createHash('sha256');
    hash.update(salt);
    hash.update(password);
    return { digest: hash.digest('hex'), salt: salt };
  },
});

module.exports = User;
