'use strict';

var fs = require('graceful-fs');
var through = require('through2');
var extend = require('extend-shallow');
var stats = require('file-stat');

/**
 * Add the `contents` property to a `file` object.
 *
 * @param  {Object} `options`
 * @return {Object} File object.
 */

module.exports = function fileContents(options) {
  return through.obj(function (file, enc, cb) {
    var stream = this;

    getContents(file, options, function (err, res) {
      if (err) {
        stream.emit('error', err);
        return cb(err);
      }
      stream.push(res);
      return cb();
    });
  });
};

function getContents(file, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  if (typeof file.stat === 'undefined') {
    return stats.getStats(file, function (err, res) {
      getContents(res, options, cb);
    });
  }

  if (file.stat.isDirectory()) {
    return cb(null, file);
  }

  var opts = extend({}, options, file.options || {});

  if (opts.noread === true || opts.read === false) {
    return cb(null, file);
  }

  if (opts.buffer !== false) {
    return fs.readFile(file.path, function(err, data) {
      if (err) return cb(err);

      file.contents = data;
      return cb(null, file);
    });
  }

  try {
    file.contents = fs.createReadStream(file.path);
    return cb(null, file);
  } catch (err) {
    return cb(err);
  }
}

/**
 * Expose `getContents`
 */

module.exports.getContents = getContents;
