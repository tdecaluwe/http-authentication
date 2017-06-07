var express = require('express');
var authentication = require('http-authentication');

var app = express();

var users = {
  'John': { password: 'password' }
};

app.use(authentication(function (username, done) {
  done(null, users[username] && users[username].password);
}).connect());

app.get('/', function (req, res) {
  res.end('Successfully authenticated to express!');
});

app.listen(3000);
