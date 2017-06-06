'use strict'

var crypto = require('crypto');

var Authenticator = function (detector, identify) {
  this.detector = detector;
  this.identify = identify;
};

var hash = function (array) {
  return crypto.createHash('md5').update(array.join(':')).digest('hex');
};

var parse = function (authorization) {
  var strings = /([a-z]*)=("[^"]*")(,|$)/g;
  var unquoted = /([a-z]*)=([0-9A-Za-z]*)(,|$)/g;
  var digest = {}, match;

  // Parse all quoted values in the authorization header.
  while (match = strings.exec(authorization)) {
    digest[match[1]] = JSON.parse(match[2]);
  }

  // Parse the unquoted qop and nc values.
  while (match = unquoted.exec(authorization)) {
    digest[match[1]] = match[2];
  }

  return digest;
};

var authenticate = function (digest, method, password) {
  var identity;
  var resource;

  // Protect against undefined passwords.
  if (password !== undefined && password !== null) {
    identity = hash([digest.username, digest.realm, password]);
    resource = hash([method, digest.uri]);
    return digest.response === hash([
      identity,
      digest.nonce,
      digest.nc,
      digest.cnonce,
      digest.qop,
      resource
    ]);
  } else {
    return false;
  }
};

Authenticator.prototype.nonce = function () {
  var nonce = Math.random();
  this.detector.register(nonce);
  return nonce;
};

Authenticator.prototype.header = function (realm) {
  var result = '';

  result += 'Digest realm="' + realm + '"';
  result += 'qop="auth",nonce="' + this.nonce() + '"';
  result += 'opaque="' + hash([realm]) + '"';

  return result;
};

Authenticator.prototype.authenticate = function (req, options) {
  var that = this;
  var digest;
  var realm;

  options = options || {};

  realm = options.realm || '';

  var done = function (error, password) {
    if (password === undefined) {
      that.fail(that.header(realm));
    } else if (authenticate(digest, req.method, password) !== true) {
      that.fail(that.header(realm));
    } else {
      that.success(digest.username);
    }
  };

  if (req.headers.authorization === undefined) {
    // No authorization header was found in the request.
    this.fail(this.header(realm));
  } else {
    digest = parse(req.headers.authorization);


    if (this.detector.check(digest.nonce, parseInt(digest.nc, 16)) !== true) {
      // The detector flagged this request.
      this.fail(this.header(realm));
    } else if (digest.realm !== realm) {
      // Authentication for a different realm was requested.
      this.fail(this.header(realm));
    } else {
      // Call the user provided callback to get the password.
      this.identify(digest.username, done);
    }
  }
};

Authenticator.prototype.listener = function (options, callback) {
  var that = this;

  return function (req, res) {
    var local = Object.create(that);

    local.success = function (user) {
      callback(req, res);
    };

    local.fail = function (header) {
      res.writeHead(401, {
        'WWW-Authenticate': header
      });
      res.end('Unauthorized');
    };

    local.authenticate(req, options);
  };
};

module.exports = Authenticator;
