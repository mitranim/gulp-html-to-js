'use strict'

const fs = require('fs')
const cp = require('child_process')

let proc

function test() {
  if (proc) proc.kill()
  proc = cp.fork('./test.js')
  proc.once('exit', onDone)
}

function onDone(code) {
  if (code) console.error(`Test failed with exit code ${code}`)
  else console.info(`Test finished successfully`)
}

fs.watch('gulp-html-to-js.js', test)
fs.watch('test.js', test)
