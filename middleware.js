'use strict'

var Authenticator = require('./authenticator.js');
var ReplayDetector = require('./replaydetector.js');

var create = function (options, callback) {
  options = options || {};

  var detector = new ReplayDetector(options.timeout);
  var authenticator = new Authenticator(detector, callback);

  return authenticator;
};

module.exports.connect = function (options, callback) {
  var strategy = create(options, callback);

  return function (req, res, next) {
    var local = Object.create(strategy);

    local.success = function (user) {
      next();
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

module.exports.passport = function (options, callback) {
  var strategy = create(options, callback);

  strategy.name = 'digest';

  return strategy;
};
