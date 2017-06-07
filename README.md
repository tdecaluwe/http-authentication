# http-authentication

HTTP Basic and Digest authentication. Setting up Digest authentication
with protection against replay attacks can be as easy as:

```javascript
var express = require('express');
var authentication = require('http-authentication');

var app = express();

var users = {
  'John': { password: 'password' }
};

app.use(authentication(function (user, done) {
  done(null, users[user] && users[user].password);
}).connect());

app.get('/', function (req, res) {
  res.end('Successfully authenticated!');
});

app.listen(3000);
```

## Configuration

The module provides an authenticator object creation function which can be
called as follows:

```javascript
var auth = require('http-authentication');

var authenticator = auth([options,] callback);
```

The `options` argument is optional and can be used to configure the
authenticator object. It should be an object containing any of the parameters
below.

Option    | Type     | Possible values
--------: | :------: | :--------------
`method`  | `String` | Either `'basic'` or `'digest'`, default value is `'digest'`.
`timeout` | `Number` | A timeout can be specified for digest authentication and should be a positive integer value. It specifies the time in seconds after which a nonce provided by the server can no longer be used for authentication. If this value is set to zero, the nonces will never expire.

These authenticator objects cannot be used directly but can be used to create
listeners or middlewares through methods defined on the authenticator object:

Method     | Return value type           | Possible values
---------: | :-------------------------: | :--------------
`listener` | `Function (req, res)`       | A general purpose listener accepting a request/response pair.
`connect`  | `Function (req, res, next)` | A connect middleware.
`passport` | `Authenticator`             | An object that is compatible with `passport.Strategy`.

For usage examples see the section on middlewares.

Two alternative constructors are provided for the basic and digest method
respectively. They can be called as follows:

```javascript
var auth = require('http-authentication');

var authenticator = auth.basic(callback);
var authenticator = auth.digest([options,] callback);
```

## Replay protection

Protection against replay attacks is provided by the `ReplayDetector` class and
is included with each middleware. This class also handles expiration of server
provided nonces. It only keeps track of non-expired nonces, expired nonces are
automatically discarded.

## Middleware

Middleware can be created for various frameworks. They can optionally be
configured using any of the parameters below:

Option   | Type     | Possible values
-------: | :------: | :--------------
`realm`  | `String` | The name of the realm to be used for authentication.

### `http.Server`

```javascript
var auth = require('http-authentication');

var authenticator = auth(options, callback);

// Authenticate another listener.
var privateListener = authenticator.listener([options,] listener);

http.createServer(privateListener);
```

### Express

```javascript
var auth = require('http-authentication');

var authenticator = auth(options, callback);

// Obtain a connect middleware.
var connect = authenticator.connect([options]);

app.use(connect);
```

### Passport

```javascript
var auth = require('http-authentication');

var authenticator = auth(options, callback);

// Obtain a passport strategy. Options can be passed to
// passport itself.
var strategy = authenticator.strategy();

passport.use(strategy);
```
