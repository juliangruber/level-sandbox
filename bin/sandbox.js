#!/usr/bin/env node

/**
 * Module dependencies.
 */

var level = require('level');
var net = require('net');
var multilevel = require('multilevel');
var program = require('commander');
var pkg = require('../package');

// options

program
.version(pkg.version)
.option('-p, --port <n>', 'port to listen on', 4646)
.option('-a, --auth <auth>', 'authorization')
.parse(process.argv);

// database

var db = level('db');

// multilevel options

var opts = program.auth
  ? { auth: auth, access: access }
  : {};

// tcp server

var server = net.createServer(function(con){
  var stream = multilevel.server(db, opts);
  
  stream.on('error', console.error);
  con.on('error', console.error);
  con.pipe(stream).pipe(con);
});

server.listen(program.port, function(){
  console.log('listening on port %s', program.port);
});

/**
 * Auth.
 *
 * @param {String} str
 * @param {Function} fn
 */

function auth(user, fn){
  if(user !== program.auth) {
    fn(new Error('invalid credentials'));
  } else {
    fn(null, true);
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
  if (!user) throw new Error('.auth() required');
}
