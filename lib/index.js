'use strict'

/**
 * Dependencies
 */

const through = require('through2')
const File = require('vinyl')

/**
 * Lib
 */

// Options:
//   .concat  -- concat all files into the given name/path. If provided, the
//               resulting module exports an object with views keyed by short
//               file paths. If not provided, each module exports its view as a
//               string.
module.exports = function textToJs (options) {
  const concat = options && options.concat

  if (!concat) {
    return through.obj(function transform (file, _, done) {
      if (file.isBuffer()) {
        done(null, new File({
          path: file.relative + '.js',
          contents: new Buffer(textToModule(file.contents.toString()))
        }))
      }
    })
  }

  // Concat mode
  if (concat) {
    if (typeof concat !== 'string') {
      throw Error(`Option 'concat' must be a string, got: ${concat}`)
    }

    const results = []

    return through.obj(
      function transform (file, _, done) {
        if (file.isBuffer()) {
          results.push(textToExport(file.contents.toString(), file.relative))
        }
        done(null)
      },
      function flush (done) {
        done(null, new File({
          path: options.concat,
          contents: new Buffer(join(results))
        }))
      }
    )
  }
}

function textToModule (text) {
  return `'use strict';
module.exports = '${escape(text)}';
`
}

function textToExport (text, path) {
  return `module.exports['${escape(path)}'] = '${escape(text)}'`
}

function join (results) {
  return `'use strict';
module.exports = Object.create(null);
${results.join(';\n')};
`
}

function escape (text) {
  return text.replace(/'/g, "\\'").replace(/\r\n|\n/g, '\\n')
}
