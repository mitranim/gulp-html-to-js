'use strict'

const pt = require('path')
const gulpHtmlToJs = require(process.cwd())
const assert = require('assert')

/**
 * Without concat
 */

{
  const stream = gulpHtmlToJs()

  for (const file of mockFiles()) {
    stream._transform(file, null, throwAny)
  }

  const results = readAll(stream)
  const paths = results.map(x => x.relative).sort()
  const contents = results.map(x => x.contents.toString()).sort()

  assert.deepEqual(paths, [
    `html/first.html.js`,
    `html/second.html.js`,
  ])

  assert.deepEqual(contents, [
    `module.exports = '<p>\\n  "second"\\n</p>'`,
    `module.exports = '<p>\\n  \\'first\\'\\n</p>'`,
  ])
}

/**
 * With concat
 */

{
  const stream = gulpHtmlToJs({concat: 'html.js'})

  for (const file of mockFiles()) {
    stream._transform(file, null, throwAny)
  }
  stream._flush(throwAny)

  const results = readAll(stream)

  assert.equal(results.length, 1)

  assert.equal(results[0].relative, 'html.js')

  assert.equal(results[0].contents.toString(),
`module.exports = Object.create(null)
module.exports['html/first.html'] = '<p>\\n  \\'first\\'\\n</p>'
module.exports['html/second.html'] = '<p>\\n  "second"\\n</p>'`)
}

/**
 * With path prefix
 */

{
  const stream = gulpHtmlToJs({concat: 'html.js', prefix: 'templates'})

  for (const file of mockFiles()) {
    stream._transform(file, null, throwAny)
  }
  stream._flush(throwAny)

  const results = readAll(stream)

  assert.equal(results.length, 1)

  assert.equal(results[0].relative, 'html.js')

  assert.equal(results[0].contents.toString(),
`module.exports = Object.create(null)
module.exports['templates/html/first.html'] = '<p>\\n  \\'first\\'\\n</p>'
module.exports['templates/html/second.html'] = '<p>\\n  "second"\\n</p>'`)
}

/**
 * With global
 */

{
  const stream = gulpHtmlToJs({concat: 'html.js', global: 'window.templates'})

  for (const file of mockFiles()) {
    stream._transform(file, null, throwAny)
  }
  stream._flush(throwAny)

  const results = readAll(stream)

  assert.equal(results.length, 1)

  assert.equal(results[0].relative, 'html.js')

  assert.equal(results[0].contents.toString(),
`window.templates = Object.create(null)
window.templates['html/first.html'] = '<p>\\n  \\'first\\'\\n</p>'
window.templates['html/second.html'] = '<p>\\n  "second"\\n</p>'`)
}

/**
 * Utils
 */

function mockFile() {
  return {
    isNull:      () => false,
    isStream:    () => false,
    isDirectory: () => false,
    isBuffer:    () => true,
    path:        undefined,
    relative:    undefined,
    contents:    undefined,
  }
}

function mockFiles() {
  return [
    {
      ...mockFile(),
      contents: new Buffer(
`<p>
  'first'
</p>`),
      path: pt.join(process.cwd(), 'html/first.html'),
      relative: 'html/first.html',
    },
    {
      ...mockFile(),
      contents: new Buffer(
`<p>
  "second"
</p>`),
      path: pt.join(process.cwd(), 'html/second.html'),
      relative: 'html/second.html',
    },
  ]
}

function throwAny(err) {
  if (err) throw err
}

function readAll(stream) {
  const out = []
  while (stream._readableState.buffer.length) out.push(stream.read())
  return out
}
