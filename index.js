'use strict'

var Basic = require('./basic.js');
var Digest = require('./digest.js');
var ReplayDetector = require('./replaydetector.js');

module.exports = function (options, callback) {
  if (options instanceof Function) {
    callback = options;
    options = undefined;
  }

  if (options && options.method === 'basic') {
    return module.exports.basic(callback);
  } else {
    return module.exports.digest(options, callback);
  }
};

module.exports.basic = function (callback) {
  return new Basic(callback);
};

module.exports.digest = function (options, callback) {
  var config = {};

  options = options || {};
  config.timeout = options.timeout || 0;

  return new Digest(new ReplayDetector(config.timeout), callback);
};
