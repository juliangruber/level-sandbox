
var spawn = require('child_process').spawn;
var assert = require('assert');
var equal = assert.equal;
var exists = require('fs').existsSync;
var join = require('path').join;
var mkdir = require('fs').mkdirSync;
var connect = require('net').connect;
var multilevel = require('multilevel');

describe('sandbox', function(){
  
  var dir;
  
  beforeEach(function(){
    dir = '/tmp/' + Math.random().toString(16).slice(2);
    mkdir(dir);
    mkdir(dir + 'a');
    mkdir(dir + 'b');
  });
  
  it('should log it\'s listening', function(done){
    var ps = spawn(__dirname + '/bin/sandbox.js', { cwd: dir });
    ps.stderr.once('data', done);
    ps.stdout.once('data', function(line){
      ps.kill();
      equal('listening on port 4646\n', line.toString());
      done();
    });
  });
  
  it('should create a db', function(done){
    var ps = spawn(__dirname + '/bin/sandbox.js', { cwd: dir });
    ps.stderr.once('data', done);
    ps.stdout.once('data', function(){
      ps.kill();
      assert(exists(join(dir, 'db')));
      done();
    });
  });
  
  it('should listen on a port', function(done){
    var ps = spawn(__dirname + '/bin/sandbox.js', { cwd: dir });
    ps.stderr.on('data', done);
    ps.stdout.once('data', function(){
      var con = connect(4646);
      var db = multilevel.client();
      con.pipe(db.createRpcStream()).pipe(con);
      db.put('foo', 'bar', function(err){
        ps.kill();
        assert(!err);
        done();
      });
    });
  });
  
  it('should listen on a custom port', function(done){
    var args = ['--port', '4747'];
    var ps = spawn(__dirname + '/bin/sandbox.js', args, { cwd: dir });
    ps.stderr.on('data', done);
    ps.stdout.once('data', function(){
      var con = connect(4747);
      var db = multilevel.client();
      con.pipe(db.createRpcStream()).pipe(con);
      db.put('foo', 'bar', function(err){
        ps.kill();
        assert(!err);
        done();
      });
    });
  });
  
  it('should crash when a port is taken', function(done){
    var a = spawn(__dirname + '/bin/sandbox.js', { cwd: dir + 'a' });
    a.stderr.once('data', done);
    a.stdout.once('data', function(){
      var b = spawn(__dirname + '/bin/sandbox.js', { cwd: dir + 'b' });
      b.stderr.once('data', function(){
        a.kill();
        b.on('exit', function(code){
          assert(code > 0);
          done();
        });
      });
    });
  });
  
  it('should catch tcp errors without crashing');
  
  it('should catch multilevel errors without crashing', function(done){
    var ps = spawn(__dirname + '/bin/sandbox.js', { cwd: dir });
    ps.stdout.once('data', function(){
      var con = connect(4646);
      con.write('attack lol\n');
      ps.on('exit', done);
      ps.stderr.once('data', function(){
        var db = multilevel.client();
        con = connect(4646);
        con.pipe(db.createRpcStream()).pipe(con);
        db.put('foo', 'bar', function(err){
          ps.removeListener('exit', done);
          ps.kill();
          assert(!err);
          done();
        });
      });
    });
  });
  
  it('should revoke invalid auth', function(done){
    var args = ['--auth', 'password'];
    var ps = spawn(__dirname + '/bin/sandbox.js', args, { cwd: dir });
    ps.stderr.on('data', done);
    ps.stdout.once('data', function(){
      var con = connect(4646);
      var db = multilevel.client();
      con.pipe(db.createRpcStream()).pipe(con);
      db.auth('foobar', function(err){
        ps.kill();
        assert(err);
        done();
      });
    });
  });
  
  it('should accept valid auth', function(done){
    var args = ['--auth', 'password'];
    var ps = spawn(__dirname + '/bin/sandbox.js', args, { cwd: dir });
    ps.stderr.on('data', done);
    ps.stdout.once('data', function(){
      var con = connect(4646);
      var db = multilevel.client();
      con.pipe(db.createRpcStream()).pipe(con);
      db.auth('password', function(err){
        ps.kill();
        assert(!err);
        done();
      });
    });
  });
  
  it('should deny access with invalid auth', function(done){
    var args = ['--auth', 'password'];
    var ps = spawn(__dirname + '/bin/sandbox.js', args, { cwd: dir });
    ps.stderr.on('data', done);
    ps.stdout.once('data', function(){
      var con = connect(4646);
      var db = multilevel.client();
      con.pipe(db.createRpcStream()).pipe(con);
      db.put('foo', 'bar', function(err){
        ps.kill();
        assert(err);
        done();
      });
    });
  });
  
  it('should grant access with valid auth', function(done){
    var args = ['--auth', 'password'];
    var ps = spawn(__dirname + '/bin/sandbox.js', args, { cwd: dir });
    ps.stderr.on('data', done);
    ps.stdout.once('data', function(){
      var con = connect(4646);
      var db = multilevel.client();
      con.pipe(db.createRpcStream()).pipe(con);
      db.auth('password', function(err){
        assert(!err);
        db.put('foo', 'bar', function(err){
          ps.kill();
          assert(!err);
          done();
        });
      });
    });
  });
});
