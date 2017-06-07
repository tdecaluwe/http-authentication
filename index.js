'use strict'

var Digest = require('./digest.js');
var ReplayDetector = require('./replaydetector.js');

module.exports = function (options, callback) {
  var config = {};

  if (options instanceof Function) {
    callback = options;
    options = undefined;
  }

  options = options || {};

  config.timeout = options.timeout || 0;

  return new Digest(new ReplayDetector(options.timeout), callback);
};
