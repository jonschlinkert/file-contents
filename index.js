'use strict';

var utils = require('./utils');

/**
 * Add the `contents` property to a `file` object.
 *
 * @param  {Object} `options`
 * @return {Object} File object.
 */

module.exports = function fileContents(options) {
  return utils.through.obj(function (file, enc, next) {
    var stream = this;

    async(file, options, function (err, res) {
      if (err) {
        next(err);
        return;
      }
      next(null, res);
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
    throw new TypeError('expected file to be an object');
  }

  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  if (typeof cb !== 'function') {
    throw new TypeError('expected callback to be a function');
  }

  if (!file.stat) {
    return utils.stats.getStats(file, function (err, res) {
      if (err) return cb(err);

      async(res, options, cb);
    });
  }

  try {
    if (file.stat.isDirectory()) {
      cb(null, file);
      return;
    }
  } catch(err) {
    cb(err);
    return;
  }

  var opts = utils.extend({}, options, file.options || {});
  if (opts.noread === true || opts.read === false) {
    cb(null, file);
    return;
  }

  if (opts.buffer !== false) {
    return utils.fs.readFile(file.path, function(err, data) {
      if (err) {
        cb(err);
        return;
      }
      file.contents = data;
      cb(null, file);
    });
  }

  try {
    file.contents = utils.fs.createReadStream(file.path);
    cb(null, file);
  } catch (err) {
    cb(err);
    return;
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
    throw new TypeError('expected file to be an object.');
  }

  var fs = utils.fs;
  if (typeof file.stat === 'undefined') {
    file.stat = fs.lstatSync(file.path);
  }

  if (isDirSync(file)) {
    return file;
  }

  var opts = utils.extend({}, options, file.options);
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
    throw err;
  }
}

function isDirSync(file) {
  try {
    return file.stat.isDirectory();
  } catch(err) {
    throw err;
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
