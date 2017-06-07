var express = require('express');
var passport = require('passport');
var authentication = require('http-authentication');

var app = express();

var users = {
  'John': { password: 'password' }
};

passport.use(authentication(function (username, done) {
  done(null, users[username] && users[username].password);
}).passport());

app.get('/', passport.authenticate('digest', { session: false }), function (req, res) {
  res.end('Successfully authenticated with passport!');
});

app.listen(3000);
