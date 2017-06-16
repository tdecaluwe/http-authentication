'use strict'

/**
 * Abstract base class implementing the common http authentication logic.
 *
 * @constructs Authenticator
 * @param {Function} identify - A function performing the password lookup.
 */
var Authenticator = function (identify) {
  this.identify = identify;
};

/**
 * Authenticate a request.
 *
 * @description This function expects additional `success` and `fail` callbacks
 * to be defined on the `this` object. It will call the first one in case of a
 * succesful authentication, otherwise the second one will be called.
 *
 * @param {http.IncomingMessage} req - The request to be authenticated.
 * @param {Object} options - An object defining authentication options.
 */
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

/**
 * Construct a function that can be used as a `http.Server` listener.
 *
 * @param {Object} options - An object defining authentication options.
 * @param {Function} callback - An optional callback to be called after a
 * succesful authentication.
 * @returns {Function} A function accepting a request/response pair.
 */
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

/**
 * Construct a connect middleware.
 *
 * @param {Object} options - An object defining authentication options.
 * @returns {Function} A connect middleware callback.
 */
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
