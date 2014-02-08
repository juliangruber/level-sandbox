# level-sandbox

  A sandbox for hosting leveldbs.

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

var con = net.connect(4646);
con.pipe(db.createRpcStream()).pipe(con);

db.auth('foobar', function(err){
  db.put('foo', 'bar', function(err){
    db.get('foo', function(err, value){
      console.log('foo: %s', value);
    });
  });
});
```

## API

```

  Usage: sandbox.js [options] [path]
  
  Options:
  
    -h, --help          output usage information
    -V, --version       output the version number
    -p, --port <n>      port to listen on
    -a, --auth <auth>   authorization
    -l, --log <events>  log events to stdio

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
$ level-sandbox --log all
```

## Deploying

  Use a tool like [upstart](http://upstart.ubuntu.com/) or
  [forever](https://github.com/nodejitsu/forever) to make sure the process keeps
  running. Crashes are highly unlikely but might be caused by memory leaks or
  other kinds of bugs somewhere in the stack.

## TODO

  - change password without restart
  - encrypt connection

## License

  MIT
