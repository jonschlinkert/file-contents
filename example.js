var through = require('through2');
var contents = require('./');

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
