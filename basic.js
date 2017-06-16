'use strict'

var crypto = require('crypto');

var Authenticator = require('./authenticator.js');

/**
 * A class implementing http basic authentication.
 *
 * @constructs Basic
 * @param {Function} identify - A function performing the password lookup.
 */
var Basic = function (identify) {
  Authenticator.call(this, identify);
};

Basic.prototype = Object.create(Authenticator.prototype);

Basic.prototype.parse = function (authorization) {
  var format = /^Basic ([0-9A-Za-z+/=]*)$/;
  var decoded, array, fields = {};

  if (format.test(authorization)) {
    decoded = Buffer.from(format.exec(authorization)[1], 'base64').toString();

    array = decoded.split(':');

    if (array.length > 1) {
      fields.username = array[0];
      fields.password = decoded.substr(array[0].length + 1, decoded.length);
    }
  }

  return fields;
};

Basic.prototype.check = function (fields, realm, password) {
  // Protect against undefined passwords.
  if (password !== undefined && password !== null) {
    return fields.password === password;
  } else {
    return false;
  }
};

Basic.prototype.header = function (realm) {
  return 'Basic realm="' + realm + '"';
};

/**
 * Request an authentication strategy for the passport module.
 *
 * @returns {passport.Strategy} A passport strategy for basic authentication.
 */
Basic.prototype.passport = function () {
  this.name = 'basic';

  return this;
};

module.exports = Basic;
