'use strict';

/* deps: mocha */
var through = require('through2');
var assert = require('assert');
var contents = require('./');

function streamify(fp) {
  var stream = through.obj();
  stream.write({path: fp});
  stream.end();
  return stream;
}

describe('add a `contents` property to the given object', function () {
  it('should work as a plugin in a stream:', function (done) {
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

  it('`getContents` should work as an async function:', function (done) {
    contents.getContents({path: 'README.md'}, function (err, file) {
      if (err) return done(err);

      assert.equal(typeof file.contents.toString(), 'string');
      done();
    });
  });
});
