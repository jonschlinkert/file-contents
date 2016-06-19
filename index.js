'use strict';

var utils = require('./utils');

/**
 * Add the `contents` property to a `file` object.
 *
 * @param  {Object} `options`
 * @return {Object} File object.
 */

module.exports = function fileContents(options) {
  return utils.through.obj(function(file, enc, cb) {
    async(file, options, function(err, res) {
      if (err) {
        cb(err);
        return;
      }
      cb(null, res);
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

  if (typeof file.stat === 'undefined') {
    utils.stats.lstatSync(file);
  }

  try {
    if (file.stat === null || file.stat.isDirectory()) {
      cb(null, file);
      return;
    }
  } catch (err) {
    cb(err);
    return;
  }

  var opts = utils.extend({}, options, file.options || {});
  if (opts.noread === true || opts.read === false) {
    cb(null, file);
    return;
  }

  if (file.contents || file.contents === null) {
    utils.syncContents(file, opts);
    cb(null, file);
    return;
  }

  if (opts.buffer !== false) {
    return utils.fs.readFile(file.path, function(err, data) {
      if (err) {
        cb(err);
        return;
      }

      file.contents = utils.stripBom(data);
      utils.syncContents(file, opts);
      cb(null, file);
    });
  }

  try {
    utils.syncContents(file, opts);
    cb(null, file);
  } catch (err) {
    cb(err);
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
    throw new TypeError('expected file to be an object');
  }

  if (!file.stat) {
    utils.stats.lstatSync(file);
  }

  if (!file.stat || file.stat.isDirectory()) {
    return file;
  }

  var opts = utils.extend({}, options, file.options);
  utils.syncContents(file, opts);
  return file;
}

/**
 * Expose `async` method
 */

module.exports.async = async;

/**
 * Expose `sync` method
 */

module.exports.sync = sync;
