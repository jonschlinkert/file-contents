'use strict';

var utils = require('./utils');

/**
 * Add the `contents` property to a `file` object.
 *
 * @param  {Object} `options`
 * @return {Object} File object.
 */

module.exports = function(options) {
  return utils.through.obj(function(file, enc, next) {
    asyncContents(file, options, next);
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

function asyncContents(file, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  if (typeof cb !== 'function') {
    throw new TypeError('expected a callback function');
  }

  if (!utils.isObject(file)) {
    cb(new TypeError('expected file to be an object'));
    return;
  }

  utils.stats.stat(file, function(err, file) {
    if (err && err.code !== 'ENOENT') {
      cb(err);
      return;
    }
    utils.syncContents(file, options);
    cb(null, file);
  });
}

/**
 * Sync method for getting `file.contents`.
 *
 * @param  {Object} `file`
 * @param  {Object} `options`
 * @return {Object}
 */

function syncContents(file, options) {
  if (!utils.isObject(file)) {
    throw new TypeError('expected file to be an object');
  }

  utils.stats.statSync(file);
  utils.syncContents(file, options);
  return file;
}

/**
 * Expose `async` method
 */

module.exports.async = asyncContents;

/**
 * Expose `sync` method
 */

module.exports.sync = syncContents;
