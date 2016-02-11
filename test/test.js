'use strict'

/**
 * Dependencies
 */

const _ = require('lodash')
const pt = require('path')
const plugin = require(process.cwd())

/**
 * Globals
 */

let stream, paths, contents, result

/**
 * Without concat
 */

stream = plugin()

const results = []

for (const file of files()) {
  stream._transform(file, null, (err, result) => {
    if (err) throw err
    results.push(result)
  })
}

if (_.isFunction(stream._flush)) throw Error()

paths = _.sortBy(_.map(results, 'relative'))

if (!_.isEqual(paths, ['html/first.html.js', 'html/second.html.js'])) throw Error()

contents = _(results).map(x => x.contents.toString()).sortBy().value()

if (!_.isEqual(contents, [
  `'use strict';\nmodule.exports = '<p>\\n  "second"\\n</p>';\n`,
  `'use strict';\nmodule.exports = '<p>\\n  \\'first\\'\\n</p>';\n`
])) throw Error()

/**
 * With concat
 */

stream = plugin({concat: 'view.js'})

for (const file of files()) {
  stream._transform(file, null, onerror)
}

stream._flush(onerror)

const buffer = stream._readableState.buffer

if (buffer.length !== 1) throw Error()

result = buffer[0]

if (!result) throw Error()

if (result.relative !== 'view.js') throw Error()

if (result.contents.toString() !== `'use strict';
module.exports = Object.create(null);
module.exports['html/first.html'] = '<p>\\n  \\'first\\'\\n</p>';
module.exports['html/second.html'] = '<p>\\n  "second"\\n</p>';\n`) throw Error()

/**
 * Utils
 */

function mockFile () {
  return {
    isNull: () => false,
    isStream: () => false,
    isDirectory: () => false,
    isBuffer: () => true,
    clone () { return _.clone(this) }
  }
}

// Mock text files.
function files () {
  return [
    merge(mockFile(), {
      contents: new Buffer(
`<p>
  'first'
</p>`),
      path: pt.join(process.cwd(), 'html/first.html'),
      relative: 'html/first.html'
    }),
    merge(mockFile(), {
      contents: new Buffer(
`<p>
  "second"
</p>`),
      path: pt.join(process.cwd(), 'html/second.html'),
      relative: 'html/second.html'
    })
  ]
}

function merge () {
  return _.reduce(arguments, _.merge, {})
}

/**
 * Misc
 */

function onerror (err) {
  if (err) throw err
}

console.log(`[${pad(new Date().getHours())}:${pad(new Date().getMinutes())}:${pad(new Date().getSeconds())}] Finished test without errors.`)

function pad (val) {
  return _.padStart(val, 2, '0')
}
