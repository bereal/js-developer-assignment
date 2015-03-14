'use strict';
var $ = require('jquery');
var Promise = require('promise');

function UserModel(src) {
    this.src = src;
}

UserModel.prototype = {
    list: function() {
        return Promise.resolve($.ajax(this.src));
    },

    addUser: function(data) {
        if (!(data.username && data.password)) {
            return Promise.reject('Username and password are required');
        }

        return new Promise(function(fulfil, reject) {
            var req = $.ajax({
                method: 'POST',
                url: this.src,
                data: data,
                dataType: 'json'
            });
            req.success(fulfil);
            req.error(function(err) {
                reject(err.responseJSON.error_description);
            });
        }.bind(this));
    }
};

module.exports.connect = function (src) {
    return new UserModel(src);
}
