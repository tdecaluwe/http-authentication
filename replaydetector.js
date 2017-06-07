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
  var node;

  if (this.items[nonce.toString()] === undefined) {
    node = {
      nonce: nonce,
      updated: Date.now(),
      counter: 0,
      previous: this.last.previous,
      next: this.last
    };

    // Insert the new node at the end of the list.
    this.last.previous.next = node;
    this.last.previous = node;

    this.items[nonce.toString()] = node;
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

        // Unlink from the list.
        previous = node.previous;

        node.previous.next = node.next;
        node.next.previous = previous;

        // Insert at the end of the list.
        node.previous = this.last.previous;
        node.next = this.last;

        this.last.previous.next = node;
        this.last.previous = node;

        result = true;
      }
    }
  }

  return result;
};

ReplayDetector.prototype.remove = function (nonce) {
  var node, previous;
  var result;

  if (node = this.items[nonce.toString()]) {
    // Unlink from the list.
    previous = node.previous;

    node.previous.next = node.next;
    node.next.previous = previous;

    // Remove links to other nodes.
    delete node.previous;
    delete node.next;

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
    current = current.next;
    this.remove(current.previous.nonce);
  }
};

module.exports = ReplayDetector;
