'use strict'

const fs = require('fs')
const exec = require('child_process').exec
const testCommand = require('./package').scripts.test

const codes = {
  blue: '\x1b[34m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
}

function test () {
  exec(testCommand, (err, stdout) => {
    process.stdout.write(stdout)
    if (err) process.stderr.write(codes.red + err.toString() + codes.reset)
  })
}

fs.watch('lib', test)
fs.watch('test', test)
