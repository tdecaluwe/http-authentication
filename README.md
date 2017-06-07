# http-digest

Digest authentication for HTTP communication.

```javascript
var express = require('express');
var authentication = require('http-authentication');

var app = express();

var users = {
  'John': { password: 'password' }
};

app.use(digest(function (username, done) {
  done(null, users[username] && users[username].password);
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
