'use strict';

var utils = require('lazy-cache')(require);

/**
 * Temporarily re-assign `require` so we can fool browserify
 * into recognizing lazy deps.
 */

var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 * (here, `require` is actually lazy-cache)
 */

require('file-stat', 'stats');
require('graceful-fs', 'fs');
require('extend-shallow', 'extend');
require('through2', 'through');

/**
 * Reset require
 */

require = fn;

/**
 * Expose utils
 */

module.exports = utils;
