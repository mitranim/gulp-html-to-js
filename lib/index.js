'use strict';

/******************************* Dependencies ********************************/

var pt      = require('path');
var through = require('through2');
var File    = require('vinyl');

/********************************* Generator *********************************/

/**
 * # options.concat <string>
 * Concat all files under the given name/path. If provided, the concatenated
 * module exports an object with views keyed by short file paths. If not
 * provided, each module exports its view as a string.
 */
module.exports = function htmlToJs(options) {
  options = options || {};

  if (options.concat) {
    console.assert(typeof options.concat === 'string',
                   "'concat' must be a string, got:", options.concat);

    var concatenated = "'format cjs';\nmodule.exports = Object.create(null);\n";

    return through.obj(
      function transform(file, e, done) {
        if (file.isBuffer()) {
          concatenated += convertHtml(file.contents.toString(), file.relative);
        }
        done(null);
      },
      function flush(done) {
        this.push(new File({
          path: options.concat,
          contents: new Buffer(concatenated)
        }));
        done(null);
      }
    );
  }

  return through.obj(function transform(file, e, done) {
    if (file.isBuffer()) {
      done(null, new File({
        path: file.relative + '.js',
        contents: new Buffer(convertHtmlIntoModule(file.contents.toString()))
      }));
    }
  });
}

function convertHtml(view, path) {
  var wrapped = "'" + view.replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";
  return 'module.exports[\'' + path.replace(/'/g, "\\'") + '\'] = ' + wrapped + ';\n';
}

function convertHtmlIntoModule(view) {
  var wrapped = "'" + view.replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";
  return "'format cjs';\nmodule.exports = " + wrapped + ";\n";
}
