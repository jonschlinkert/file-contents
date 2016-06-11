'use strict';

require('mocha');
var isBuffer = require('is-buffer');
var through = require('through2');
var assert = require('assert');
var utils = require('./utils');
var contents = require('./');

function streamify(fp, file) {
  var stream = through.obj();
  file = file || {};
  file.path = fp;
  stream.write(file);
  stream.end();
  return stream;
}

describe('file-contents', function() {
  describe('plugin', function() {
    it('should add a `contents` property to the file object', function(cb) {
      streamify('README.md')
        .on('error', cb)
        .pipe(contents())
        .on('data', function(file) {
          assert(isBuffer(file.contents));
        })
        .on('end', function() {
          cb();
        });
    });

    it('should only read once', function(cb) {
      streamify('README.md')
        .on('error', cb)
        .pipe(contents())
        .pipe(through.obj(function(file, enc, next) {
          file.contents = new Buffer(file.contents.toString() + 'foo');
          next(null, file);
        }))
        .pipe(contents())
        .pipe(through.obj(function(file, enc, next) {
          file.contents = new Buffer(file.contents.toString() + 'bar');
          next(null, file);
        }))
        .pipe(contents())
        .on('data', function(file) {
          assert.equal(file.contents.toString().slice(-6), 'foobar');
        })
        .on('end', function() {
          cb();
        });
    });

    it('should sync the `content` and `contents` properties', function(cb) {
      streamify('README.md')
        .on('error', cb)
        .pipe(contents())
        .pipe(through.obj(function(file, enc, next) {
          assert.equal(file.contents.toString(), file.content);
          next(null, file);
        }))
        .pipe(through.obj(function(file, enc, next) {
          file.content += 'abc';
          assert.equal(file.contents.toString(), file.content);
          next(null, file);
        }))
        .pipe(through.obj(function(file, enc, next) {
          file.contents = new Buffer(file.contents.toString() + 'fooo');
          assert.equal(file.contents.toString(), file.content);
          next(null, file);
        }))
        .pipe(contents())
        .on('data', function(file) {
          assert.equal(file.contents.toString().slice(-4), 'fooo');
          assert.equal(file.contents.toString(), file.content);
        })
        .on('end', function() {
          cb();
        });
    });

    it('should emit errors', function(cb) {
      streamify('fofof.md')
        .pipe(contents({buffer: false}))
        .on('error', function(err) {
          assert(err);
          assert(err.message, 'no such file or directory');
          cb();
        });
    });

    it('should handle stat errors:', function(cb) {
      streamify('fofof.md', {stat: {}})
        .pipe(contents({buffer: false}))
        .on('error', function(err) {
          assert(err);
          assert.equal(err.message, 'file.stat.isDirectory is not a function');
          cb();
        });
    });
  });

  describe('async', function() {
    it('should expose an `async` method:', function(cb) {
      contents.async({path: 'README.md'}, function(err, file) {
        if (err) return cb(err);
        assert(file.contents);
        assert.equal(typeof file.contents.toString(), 'string');
        cb();
      });
    });

    it('should throw an error when file is invalid', function(cb) {
      try {
        contents.async();
        cb(new Error('expected an error'));
      } catch(err) {
        assert(err);
        assert.equal(err.message, 'expected file to be an object');
        cb();
      }
    });

    it('should throw an error when callback is missing', function(cb) {
      try {
        contents.async({});
        cb(new Error('expected an error'));
      } catch(err) {
        assert(err);
        assert.equal(err.message, 'expected a callback function');
        cb();
      }
    });

    it('should not read the file when it is a directory:', function(cb) {
      contents.async({path: 'fixtures'}, function(err, file) {
        if (err) return cb(err);
        assert(file);
        assert.equal(typeof file.contents, 'undefined');
        cb();
      });
    });

    it('should add a stat object if one does not already exist :', function(cb) {
      contents.async({path: 'README.md'}, function(err, file) {
        if (err) return cb(err);
        assert(file.stat);
        assert.equal(typeof file.stat, 'object');
        cb();
      });
    });

    it('should add a contents property:', function(cb) {
      contents.async({path: 'README.md'}, function(err, file) {
        if (err) return cb(err);
        assert(file);
        assert(file.contents);
        cb();
      });
    });

    it('should make contents a buffer by default:', function(cb) {
      contents.async({path: 'README.md'}, function(err, file) {
        if (err) return cb(err);
        assert(file);
        assert(isBuffer(file.contents));
        cb();
      });
    });

    it('should sync the content property:', function(cb) {
      contents.async({path: 'README.md'}, function(err, file) {
        if (err) return cb(err);
        assert(file);
        assert(isBuffer(file.contents));
        assert.equal(file.contents.toString(), file.content);
        cb();
      });
    });

    it('should handle read errors when a file does not exist:', function(cb) {
      contents.async({path: 'foo.md'}, function(err) {
        assert(err);
        assert.equal(err.message, 'ENOENT: no such file or directory, lstat \'foo.md\'');
        cb();
      });
    });

    it('should not read the file when options.read is false:', function(cb) {
      contents.async({path: 'README.md'}, { read: false }, function(err, file) {
        if (err) return cb(err);
        assert(file);
        assert.equal(file.contents, null);
        cb();
      });
    });

    it('should make contents a stream when {buffer:false}:', function(cb) {
      contents.async({path: 'README.md'}, {buffer: false}, function(err, file) {
        if (err) return cb(err);
        assert(file);
        assert(utils.isStream(file.contents));
        cb();
      });
    });
  });

  describe('sync', function() {
    it('should expose a `sync` method:', function() {
      var file = contents.sync({path: 'README.md'});
      assert.equal(typeof file.contents.toString(), 'string');
    });

    it('should read from file.path', function() {
      var file = contents.sync({path: 'README.md'});
      assert.equal(typeof file.contents.toString(), 'string');
      assert(utils.isBuffer(file.contents));
    });

    it('should sync with file.content', function() {
      var file = contents.sync({path: 'README.md'});
      assert.equal(file.contents.toString(), file.content);
    });

    it('should not try to read directories', function() {
      var file = contents.sync({path: 'fixtures'});
      assert(file);
      assert.equal(typeof file.contents, 'undefined');
    });

    it('should handle errors when a file does not exist:', function(cb) {
      try {
        contents.sync({path: 'foo.md'});
        cb(new Error('expected an error'));
      } catch(err) {
        assert(err);
        assert.equal(err.message, 'ENOENT: no such file or directory, lstat \'foo.md\'');
        cb();
      }
    });

    it('should not try to read when options.read is false', function() {
      var file = contents.sync({path: 'fixtures'}, {read: false});
      assert(file);
      assert.equal(typeof file.contents, 'undefined');
    });

    it('should not try to read when options.noread is true', function() {
      var file = contents.sync({path: 'README.md'}, {noread: true});
      assert(file);
      assert.equal(file.contents, null);
    });

    it('should read as a stream when options.buffer is false', function() {
      var file = contents.sync({path: 'README.md'}, {buffer: false});
      assert(file);
      assert(utils.isStream(file.contents));
    });

    it('should handle errors when file is invalid', function(cb) {
      try {
        contents.sync();
        cb(new Error('expected an error'));
      } catch(err) {
        assert(err);
        assert.equal(err.message, 'expected file to be an object');
        cb();
      }
    });
  });
});
