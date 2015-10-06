'use strict';

require('mocha');
var through = require('through2');
var assert = require('assert');
var contents = require('./');

function streamify(fp, file) {
  var stream = through.obj();
  file = file || {};
  file.path = fp;
  stream.write(file);
  stream.end();
  return stream;
}

describe('plugin', function () {
  it('should add a `contents` property to the file object', function (done) {
    streamify('README.md')
      .on('error', console.error)
      .pipe(contents())
      .on('data', function (file) {
        assert.equal(Buffer.isBuffer(file.contents), true);
      })
      .on('end', function () {
        done();
      });
  });

  it('should emit errors', function (done) {
    streamify('fofof.md')
      .pipe(contents({buffer: false}))
      .on('error', function (err) {
        assert(err);
        assert(/no such file or directory/.test(err.message));
        done()
      });
  });

  it('should handle stat errors:', function (done) {
    streamify('fofof.md', {stat: {}})
      .pipe(contents({buffer: false}))
      .on('error', function (err) {
        assert(err);
        assert.equal(err.message, 'file.stat.isDirectory is not a function');
        done()
      });
  });

  it('should handle stat errors:', function (done) {
    streamify('fofof.md', {stat: {}})
      .pipe(contents({buffer: false}))
      .on('error', function (err) {
        assert(err);
        assert.equal(err.message, 'file.stat.isDirectory is not a function');
        done()
      });
  });
});

describe('async', function () {
  it('should expose an `async` method:', function (done) {
    contents.async({path: 'README.md'}, function (err, file) {
      if (err) return done(err);
      assert(file.contents);
      assert.equal(typeof file.contents.toString(), 'string');
      done();
    });
  });

  it('should throw an error when file is invalid', function (done) {
    try {
      contents.async();
    } catch(err) {
      assert(err);
      assert(/expected file/.test(err.message));
      done();
    }
  });

  it('should throw an error when callback is missing', function (done) {
    try {
      contents.async({});
    } catch(err) {
      assert(err);
      assert(/expected callback/.test(err.message));
      done();
    }
  });

  it('should not read the file when it is a directory:', function (done) {
    contents.async({path: 'fixtures'}, function (err, file) {
      if (err) return done(err);
      assert(file);
      assert(typeof file.contents === 'undefined');
      done();
    });
  });

  it('should add a stat object if one does not already exist :', function (done) {
    contents.async({path: 'README.md'}, function (err, file) {
      if (err) return done(err);
      assert(file.stat);
      assert.equal(typeof file.stat, 'object');
      done();
    });
  });

  it('should add a contents property:', function (done) {
    contents.async({path: 'README.md'}, function (err, file) {
      if (err) return done(err);
      assert(file);
      assert(file.contents);
      done();
    });
  });

  it('should make contents a buffer by default:', function (done) {
    contents.async({path: 'README.md'}, function (err, file) {
      if (err) return done(err);
      assert(file);
      assert(Buffer.isBuffer(file.contents));
      done();
    });
  });

  it('should handle read errors when a file does not exist:', function (done) {
    contents.async({path: 'foo.md'}, function (err, file) {
      assert(err);
      assert.equal(err.message, 'ENOENT: no such file or directory, lstat \'foo.md\'');
      done();
    });
  });

  it('should not read the file when options.read is false:', function (done) {
    contents.async({path: 'README.md'}, { read: false }, function (err, file) {
      if (err) return done(err);
      assert(file);
      assert(typeof file.contents === 'undefined');
      done();
    });
  });

  it('should make contents a stream when {buffer:false}:', function (done) {
    contents.async({path: 'README.md'}, {buffer: false}, function (err, file) {
      if (err) return done(err);
      assert(file);
      assert(typeof file.contents === 'object');
      assert(typeof file.contents.pipe === 'function');
      done();
    });
  });
});

describe('sync', function () {
  it('should expose a `sync` method:', function () {
    var file = contents.sync({path: 'README.md'});
    assert.equal(typeof file.contents.toString(), 'string');
  });

  it('should not try to read directories', function () {
    var file = contents.sync({path: 'fixtures'});
    assert(file);
    assert.equal(typeof file.contents, 'undefined');
  });

  it('should not try to read when options.read is false', function () {
    var file = contents.sync({path: 'fixtures'}, {read: false});
    assert(file);
    assert.equal(typeof file.contents, 'undefined');
  });

  it('should not try to read when options.noread is true', function () {
    var file = contents.sync({path: 'README.md'}, {noread: true});
    assert(file);
    assert.equal(typeof file.contents, 'undefined');
  });

  it('should read as a stream when options.buffer is false', function () {
    var file = contents.sync({path: 'README.md'}, {buffer: false});
    assert(file);
    assert.equal(typeof file.contents, 'object');
    assert.equal(typeof file.contents.pipe, 'function');
  });

  it('should handle errors when file is invalid', function () {
    try {
      contents.sync();
    } catch(err) {
      assert(err);
      assert(/expected file/.test(err.message));
    }
  });
});
