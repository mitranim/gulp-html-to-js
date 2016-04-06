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
//   .prefix  -- prepend a prefix (e.g. file path) to the filename for each of
//               the HTML files supplied. Do not include the trailing slash, as
//               it gets added automatically.
//   .global  -- override the variable to which the list of HTML strings is
//               assigned to. For example `window.templates`. If not provided,
//               `module.exports` will be used for compatibility with node.js
module.exports = options => (
  options && options.concat
  ? concatMode(options)
  : baseMode()
)

function concatMode (options) {
  if (typeof options.concat !== 'string') {
    throw Error(`Option 'concat' must be a string, got: ${options.concat}`)
  }

  options.global = options.global || 'module.exports'
  const results = []

  return through.obj(
    function transform (file, _, done) {
      if (file.isBuffer()) {
        results.push(textToExport(file.contents.toString(), file.relative, options))
      }
      done(null)
    },
    function flush (done) {
      this.push(new File({
        path: options.concat,
        contents: new Buffer(join(results, options))
      }))
      done(null)
    }
  )
}

function baseMode () {
  return through.obj(function transform (file, _, done) {
    if (file.isBuffer()) {
      done(null, new File({
        path: file.relative + '.js',
        contents: new Buffer(textToModule(file.contents.toString()))
      }))
    }
  })
}

function textToModule (text) {
  return `'use strict';
module.exports = '${escape(text)}';
`
}

function textToExport (text, path, options) {
  if (options.prefix) {
    path = `${options.prefix}/${path}`
  }
  return `${options.global}['${escape(path)}'] = '${escape(text)}'`
}

function join (results, options) {
  return `'use strict';
${options.global} = Object.create(null);
${results.join(';\n')};
`
}

function escape (text) {
  return text.replace(/'/g, "\\'").replace(/\r\n|\n/g, '\\n')
}
