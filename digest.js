'use strict'

var crypto = require('crypto');

var Authenticator = require('./authenticator.js');

/**
 * A class implementing http digest authentication.
 *
 * @constructs Digest
 * @param {ReplayDetector} detector - A replay detector registering hashes.
 * @param {Function} identify - A function performing the password lookup.
 */
var Digest = function (detector, identify) {
  Authenticator.call(this, identify);

  this.detector = detector;
};

Digest.prototype = Object.create(Authenticator.prototype);

var hash = function (array) {
  return crypto.createHash('md5').update(array.join(':')).digest('hex');
};

Digest.prototype.parse = function (authorization) {
  var strings = /([a-z]*)=("[^"]*")(,|$)/g;
  var unquoted = /([a-z]*)=([0-9A-Za-z]*)(,|$)/g;
  var fields = {}, match;

  // Parse all quoted values in the authorization header.
  while (match = strings.exec(authorization)) {
    fields[match[1]] = JSON.parse(match[2]);
  }

  // Parse the unquoted qop and nc values.
  while (match = unquoted.exec(authorization)) {
    fields[match[1]] = match[2];
  }

  return fields;
};

Digest.prototype.check = function (fields, realm, password, method) {
  var identity;
  var resource;

  if (this.detector.check(fields.nonce, parseInt(fields.nc, 16)) !== true) {
    return false;
  } else if (password !== undefined && password !== null) {
    identity = hash([fields.username, realm, password]);
    resource = hash([method, fields.uri]);
    return fields.response === hash([
      identity,
      fields.nonce,
      fields.nc,
      fields.cnonce,
      fields.qop,
      resource
    ]);
  } else {
    return false;
  }
};

Digest.prototype.nonce = function () {
  var nonce = Math.random();
  this.detector.register(nonce);
  return nonce;
};

Digest.prototype.header = function (realm) {
  var result = '';

  result += 'Digest realm="' + realm + '"';
  result += 'qop="auth",nonce="' + this.nonce() + '"';
  result += 'opaque="' + hash([realm]) + '"';

  return result;
};

/**
 * Request an authentication strategy for the passport module.
 *
 * @returns {passport.Strategy} A passport strategy for digest authentication.
 */
Digest.prototype.passport = function () {
  this.name = 'digest';

  return this;
};

module.exports = Digest;
