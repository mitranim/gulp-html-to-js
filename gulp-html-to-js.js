'use strict'

const pt = require('path')
const {Transform} = require('stream')
const File = require('vinyl')

/*
Options:

options.concat

  Create just one module with the provided name that exports strings keyed by
  relative file paths. If not provided, each source file is transformed into a
  separate module.

options.prefix

  Optional prefix for each file path. Relevant only for the "concat" option.

options.global

  Identifier for the "export" object; default `module.exports` for compatibility
  with CommonJS. You can set it to something like `window.templates` if you're
  not using a module bundler.
*/
module.exports = function gulpHtmlToJs(options) {
  options = Object.assign({}, options)
  if (!options.global) options.global = 'module.exports'
  if (options.concat) return concatTransform(options)
  return separateTransform(options)
}

function concatTransform({concat, prefix, global}) {
  if (!concat || typeof concat !== 'string') {
    throw Error(`Option 'concat' must be a non-empty string, got: ${concat}`)
  }

  const lines = [`${global} = Object.create(null)`]

  return new Transform({
    objectMode: true,

    transform(file, __, done) {
      if (file.isBuffer()) {
        const path = toUnixPath(pt.join(prefix || '', file.relative))
        const text = file.contents.toString()
        lines.push(`${global}['${escape(path)}'] = '${escape(text)}'`)
      }
      done()
    },

    flush(done) {
      this.push(new File({
        path: concat,
        contents: Buffer.from(lines.join('\n')),
      }))
      done()
    },
  })
}

function separateTransform({global}) {
  return new Transform({
    objectMode: true,
    transform(file, __, done) {
      if (file.isBuffer()) {
        this.push(new File({
          path: file.relative + '.js',
          contents: Buffer.from(`${global} = '${escape(file.contents.toString())}'`),
        }))
      }
      done()
    },
  })
}

// Windows path to Unix path
function toUnixPath(text) {
  return text.replace(/\\/g, '/')
}

function escape(text) {
  return text.replace(/'/g, "\\'").replace(/\r\n|\n/g, '\\n')
}
