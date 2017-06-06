var HTTPDigest = require('http-digest');

var express = require('express');
var passport = require('passport');

var app = express();

var users = {
  'John': { password: 'password' }
};

passport.use(HTTPDigest.passport({}, function (username, done) {
  if (users[username]) {
    done(null, users[username].password);
  } else {
    done(new Error('User does not exist.'));
  }
}));

app.get('/', passport.authenticate('digest', {session: false, realm: 'Realm'}), function (req, res) {
  res.end('Successfully authenticated!');
});

app.listen(3000);
