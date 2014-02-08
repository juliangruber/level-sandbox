
# level-sandbox

## Goals

  - stable
  - fast

## Usage

  Run the DB:

```bash
$ forever level-sandbox --port 4646 --auth foobar
```

  Connect from JS:

```js
var net = require('net');
var multilevel = require('multilevel');

var db = multilevel.client();
db.auth('foobar', function(err){
  db.put('foo', 'bar', function(err){
    db.get('foo', function(err, value){
      console.log('foo: %s', value);
    });
  });
});
```

## TODO

  - change password without restart
