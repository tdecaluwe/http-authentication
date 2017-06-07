'use strict'

var Authenticator = function (identify) {
  this.identify = identify;
};

Authenticator.prototype.authenticate = function (req, options) {
  var that = this;
  var fields;
  var realm;

  options = options || {};

  realm = options.realm || '';

  var done = function (error, password) {
    if (that.check(fields, realm, password, req.method) !== true) {
      that.fail(that.header(realm));
    } else {
      that.success(fields.username);
    }
  };

  if (req.headers.authorization === undefined) {
    // No authorization header was found in the request.
    this.fail(this.header(realm));
  } else {
    fields = this.parse(req.headers.authorization);

    if (fields.username === undefined) {
      // Username is missing.
      this.fail(this.header(realm));
    } else {
      // Call the user provided callback to get the password.
      this.identify(fields.username, done);
    }
  }
};

Authenticator.prototype.listener = function (options, callback) {
  var that = this;

  if (options instanceof Function) {
    callback = options;
    options = undefined;
  }

  options = options || {};

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

Authenticator.prototype.connect = function (options) {
  var that = this;

  return function (req, res, next) {
    var listener = that.listener(options, function () {
      // Call next without arguments.
      next();
    });

    listener(req, res);
  }
};

module.exports = Authenticator;
