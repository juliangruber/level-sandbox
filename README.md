
# level-sandbox

  A sandbox for hosting a leveldb in.

## Installation

```bash
$ npm install -g level-sandbox
```

## Usage

  Start a sandbox server:

```bash
$ level-sandbox --port 4646 --auth foobar
```

  Connect to it from JS:

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

## Password prompt

  Set auth to the special value `prompt` to be asked for credentials, so they
  don't show up in your terminal.

```bash
$ level-sandbox --auth prompt
auth: ********
```

## Logging

  Those log events are available:
  
  - tcp
  - auth
  - access
  
  Get one or more of them on stdio:

```bash
$ level-sandbox --log tcp
$ level-sandbox --log auth,access
```

  Or get all:

```bash
$ level-sandbox --log *
```

## Deploying

  Use a tool like [upstart](http://upstart.ubuntu.com/) or
  [forever](https://github.com/nodejitsu/forever) to make sure the process keeps
  running. Crashes are highly unlikely but might be caused by memory leaks or
  other kinds of bugs somewhere in the stack.

## TODO

  - change password without restart
