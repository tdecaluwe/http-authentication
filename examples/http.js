var http = require('http');
var authentication = require('http-authentication');

var users = {
  'John': { password: 'password' }
};

// Creating new HTTP server.
http.createServer(authentication(function (username, done) {
  done(null, users[username] && users[username].password);
}).listener(function (req, res) {
  res.end('Successfully authenticated!');
})).listen(3000);
