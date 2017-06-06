'use strict'

var ReplayDetector = function (timeout) {
  this.first = {};
  this.last = {};

  this.first.next = this.last;
  this.last.previous = this.first;

  this.length = 0;
  this.timeout = (timeout || 0)*1000;
  this.items = {};
};

ReplayDetector.prototype.register = function (nonce) {
  var node, previous;

  if (this.items[nonce.toString()] === undefined) {
    previous = this.last.previous;

    previous.next = {
      nonce: nonce,
      updated: Date.now(),
      counter: 0,
      previous: previous,
      next: this.last
    };

    this.items[nonce.toString()] = this.last.previous = previous.next;
    this.length += 1;

    this.invalidate();
  }
};

ReplayDetector.prototype.check = function (nonce, count) {
  var node, previous;
  var result = false;
  var now = Date.now();

  if (node = this.items[nonce.toString()]) {
    if (count > node.counter) {
      if (this.timeout === 0 || now < node.updated + this.timeout) {
        node.counter = count;
        node.updated = now;
        result = true;
      }
    }
  }

  this.invalidate();

  return result;
};

ReplayDetector.prototype.remove = function (nonce) {
  var node, previous;
  var result;

  if (node = this.items[nonce.toString()]) {
    previous = node.previous;

    node.previous.next = node.next;
    node.next.previous = previous;

    delete this.items[nonce.toString()];
    this.length -= 1;

    result = true;
  } else {
    result = false;
  }
};

ReplayDetector.prototype.invalidate = function () {
  var current = this.first.next;
  var now = Date.now();

  while (current !== this.last && now > current.updated + this.timeout) {
    this.remove(current.nonce);
    current = current.next;
  }
};

module.exports = ReplayDetector;
