var http = require('http');

var HTTPDigest = require('http-digest');

var users = {
  'John': { password: 'password' }
};

// Creating new HTTP server.
http.createServer(HTTPDigest.create({}, function (username, done) {
  if (users[username]) {
    done(null, users[username].password);
  } else {
    done(new Error('User does not exist.'));
  }
}).listener({}, function (req, res) {
  res.end('Successfully authenticated!');
})).listen(3000);
