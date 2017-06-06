# http-digest

Digest authentication for HTTP communication.

```javascript
var express = require('express');
var digest = require('http-digest');

var app = express();

var users = {
  'John': { password: 'password' }
};

app.use(digest.connect({}, function (username, done) {
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
```

## Replay protection

Protection against replay attacks is provided by the `ReplayDetector` class and
is included with each middleware. This class also handles expiration of server
provided nonces. It only keeps track of non-expired nonces.
