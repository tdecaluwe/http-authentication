'use strict'

var Authenticator = require('./authenticator.js');
var ReplayDetector = require('./replaydetector.js');

module.exports.create = function (options, callback) {
  options = options || {};

  var detector = new ReplayDetector(options.timeout);
  var authenticator = new Authenticator(detector, callback);

  return authenticator;
};

module.exports.connect = function (options, callback) {
  var strategy = module.exports.create(options, callback);

  return function (req, res, next) {
    var listener = strategy.listener(options, function () {
      // Call next without arguments.
      next();
    });

    listener(req, res);
  }
};

module.exports.passport = function (options, callback) {
  var strategy = module.exports.create(options, callback);

  strategy.name = 'digest';

  return strategy;
};
