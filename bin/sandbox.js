#!/usr/bin/env node

/**
 * Module dependencies.
 */

var net = require('net');
var level = require('level');
var multilevel = require('multilevel');
var program = require('commander');
var pw = require('pw');
var pkg = require('../package');
var noop = function(){};

// process title

process.title = 'level-sandbox';

// options

program
.usage('[options] [path]')
.version(pkg.version)
.option('-p, --port <n>', 'port to listen on', 4646)
.option('-a, --auth <auth>', 'authorization')
.option('-l, --log <events>', 'log events to stdio')
.parse(process.argv);

// leveldb path

var path = program.args[0] || 'db';

// log events

var events = {
  auth: false,
  access: false,
  tcp: false
};

if ('all' == program.log) {
  Object.keys(events).forEach(function(name){
    events[name] = true;
  });
} else if (program.log) {
  var segs = program.log.split(',');
  segs.forEach(function(name){
    if (!(name in events)) throw new Error('unknown log event: ' + name);
    events[name] = true;
  });
}

// auth

if (program.auth == 'prompt') {
  process.stdout.write('auth: ');
  pw(function(auth){
    program.auth = auth;
    listen();
  });
} else {
  listen();
}

// database

var db = level(path);

// multilevel options

var opts = program.auth
  ? { auth: auth, access: access }
  : { access: access };

/**
 * Start tcp server.
 */

function listen(){
  var server = net.createServer(function(con){
    if (events.tcp) console.log('new connection');
  
    var stream = multilevel.server(db, opts);
  
    stream.on('error', events.tcp && console.error || noop);
    con.on('error', events.tpc && console.error || noop);
    con.pipe(stream).pipe(con);
  });
  
  server.listen(program.port, function(){
    console.log('listening on port %s', program.port);
  });
}

/**
 * Auth.
 *
 * @param {String} str
 * @param {Function} fn
 */

function auth(user, fn){
  if(user !== program.auth) {
    if (events.auth) console.error('auth fail: %j', user);
    fn(new Error('invalid credentials'));
  } else {
    if (events.auth) console.log('auth: %j', user);
    fn(null, user);
  }
}

/**
 * Access.
 *
 * @param {String} user
 * @param {Level} db
 * @param {String} method
 * @param {Array} args
 */

function access(user, db, method, args){
  if (program.auth && !user) {
    if (events.access) console.error('access fail:', user, method, args);
    throw new Error('.auth() required');
  } else {
    if (events.access) console.log('access:', user, method, args);
  }
}
