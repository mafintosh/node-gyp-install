#!/usr/bin/env node

var install = require('./')
var minimist = require('minimist')
var argv = minimist(process.argv, {
  booleans: ['iojs', 'nightly', 'quiet', 'force'],
  alias: {iojs: 'io', v: 'version', p: 'platform', d: 'dist', q: 'quiet', n: 'nightly', f: 'force'}
})

argv.log = !argv.quiet && require('npmlog')

if (argv.help) {
  console.error(
    'node-gyp-install [options]\n' +
    ' --version,  -v   (' + process.version + ')\n' +
    ' --platform, -p   (' + process.platform + ')\n' +
    ' --force,    -f\n' +
    ' --nightly,  -n\n' +
    ' --quiet,    -q\n' +
    ' --iojs\n'
  )
  process.exit(0)
}

install(argv, function (err) {
  if (err) console.error('Error: ' + err.message)
})
