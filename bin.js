#!/usr/bin/env node

var request = require('request')
var map = require('tar-map-stream')
var tar = require('tar-fs')
var zlib = require('zlib')
var fs = require('fs')
var path = require('path')

var io = parseInt(process.version.slice(1), 10) >= 1 // yolo
var iojsDistUrl = process.env.NVM_IOJS_ORG_MIRROR || 'https://iojs.org/dist/'
if (iojsDistUrl[iojsDistUrl.length - 1] !== '/') {
  iojsDistUrl += '/'
}
var nodeDistUrl = process.env.NVM_NODEJS_ORG_MIRROR || 'https://iojs.org/dist/'
if (nodeDistUrl[nodeDistUrl.length - 1] !== '/') {
  nodeDistUrl += '/'
}

var url = io ?
  iojsDistUrl + process.version + '/iojs-' + process.version + '.tar.gz' :
  nodeDistUrl + process.version + '/node-' + process.version + '.tar.gz'

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
