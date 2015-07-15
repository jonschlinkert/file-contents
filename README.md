# file-contents [![NPM version](https://badge.fury.io/js/file-contents.svg)](http://badge.fury.io/js/file-contents)

> Set the `contents` property on a file object in a stream.

## Install

Install with [npm](https://www.npmjs.com/)

```sh
$ npm i file-contents --save
```

## Usage

```js
var through = require('through2');
var contents = require('file-contents');

function toStream(fp) {
  var stream = through.obj();
  stream.write({path: fp});
  stream.end();
  return stream;
}

toStream('README.md')
  .pipe(contents())
  .on('data', function (file) {
    // adds `contents` object to file
    console.log(file.contents.toString());
  })
  .on('end', function () {
    console.log('Done.');
  });
```

**async**

A `.getContent()` method is exposed for non-stream usage.

```js
stats.getContent({path: 'README.md'}, function (err, res) {
  // Buffer.isBuffer(file.contents) => true
});
```

## Related projects

* [file-stat](https://github.com/jonschlinkert/file-stat): Set the `stat` property on a file object in a stream.
* [stream-loader](https://github.com/jonschlinkert/stream-loader): create a read stream from a glob of files. can be used as a loader-cache… [more](https://github.com/jonschlinkert/stream-loader)
* [vinyl](http://github.com/wearefractal/vinyl): A virtual file format
* [vinyl-fs](http://github.com/wearefractal/vinyl-fs): Vinyl adapter for the file system

## Running tests

Install dev dependencies:

```sh
$ npm i -d && npm test
```

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/jonschlinkert/file-contents/issues/new)

## Author

**Jon Schlinkert**

+ [github/jonschlinkert](https://github.com/jonschlinkert)
+ [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

## License

Copyright © 2015 Jon Schlinkert
Released under the MIT license.

***

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on July 14, 2015._