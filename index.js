'use strict'

var Basic = require('./basic.js');
var Digest = require('./digest.js');
var ReplayDetector = require('./replaydetector.js');

module.exports = function (options, callback) {
  var config = {};

  if (options instanceof Function) {
    callback = options;
    options = undefined;
  }

  options = options || {};

  if (options.method === 'basic') {
    return new Basic(callback);
  } else {
    config.timeout = options.timeout || 0;

    return new Digest(new ReplayDetector(config.timeout), callback);
  }
};
