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

    async(file, options, function (err, res) {
      if (err) {
        stream.emit('error', err);
        return cb(err);
      }
      stream.push(res);
      return cb();
    });
  });
};

/**
 * Async method for getting `file.contents`.
 *
 * @param  {Object} `file`
 * @param  {Object} `options`
 * @param  {Function} `cb`
 * @return {Object}
 */

function async(file, options, cb) {
  if (typeof file !== 'object') {
    throw new TypeError('file-contents async expects `file` to be an object.');
  }

  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  if (typeof file.stat === 'undefined') {
    return stats.getStats(file, function (err, res) {
      async(res, options, cb);
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
 * Sync method for getting `file.contents`.
 *
 * @param  {Object} `file`
 * @param  {Object} `options`
 * @return {Object}
 */

function sync(file, options) {
  if (typeof file !== 'object') {
    throw new TypeError('file-contents sync expects `file` to be an object.');
  }

  if (typeof file.stat === 'undefined') {
    file.stat = fs.statSync(file.path);
  }

  if (file.stat.isDirectory()) {
    return file;
  }

  var opts = extend({}, options, file.options || {});
  if (opts.noread === true || opts.read === false) {
    return file;
  }

  if (opts.buffer !== false) {
    file.contents = fs.readFileSync(file.path);
    return file;
  }

  try {
    file.contents = fs.createReadStream(file.path);
    return file;
  } catch (err) {
    throw new Error(err);
  }
}

/**
 * Expose `async` method
 */

module.exports.async = async;

/**
 * Expose `sync` method
 */

module.exports.sync = sync;
