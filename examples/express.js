var HTTPDigest = require('http-digest');

var express = require('express');
var app = express();

var users = {
  'John': { password: 'password' }
};

app.use(HTTPDigest.connect({}, function (username, done) {
  if (users[username]) {
    done(null, users[username].password);
  } else {
    done(new Error('User does not exist.'));
  }
}));

app.get('/', function (req, res) {
  res.end('Successfully authenticated!');
});

app.listen(3000);
