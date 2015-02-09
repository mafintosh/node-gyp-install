#!/usr/bin/env node

var request = require('request')
var map = require('tar-map-stream')
var tar = require('tar-fs')
var zlib = require('zlib')
var fs = require('fs')
var path = require('path')

var io = parseInt(process.version.slice(1), 10) >= 1 // yolo
var url = io ?
  'https://iojs.org/dist/' + process.version + '/iojs-' + process.version + '.tar.gz' :
  'http://nodejs.org/dist/' + process.version + '/node-' + process.version + '.tar.gz'

var target = path.join(process.env.HOME || process.env.USERPROFILE, '.node-gyp', process.version.slice(1))

if (fs.existsSync(path.join(target, 'installVersion'))) {
  console.log('Header files already fetched')
  console.log('node-gyp should now work for %s', process.version)
  process.exit(1)
}

console.log('Fetching header files from %s', url)

request(url)
  .pipe(zlib.createGunzip())
  .pipe(map(function (entry) {
    return /(\.gypi$)|(\.h$)/.test(entry.name) ? entry : null
  }))
  .pipe(tar.extract(target, {strip: 1}))
  .on('finish', function () {
    fs.writeFileSync(path.join(target, 'installVersion'), '9') // yolo
    console.log('node-gyp should now work for %s', process.version)
  })
