#!/usr/bin/env node

var request = require('request')
var map = require('tar-map-stream')
var tar = require('tar-fs')
var zlib = require('zlib')
var fs = require('fs')
var path = require('path')

var io = parseInt(process.version.slice(1), 10) >= 1 // yolo
var iojsDistUrl = process.env.NVM_IOJS_ORG_MIRROR || 'http://npm.taobao.org/mirrors/iojs/'
if (iojsDistUrl[iojsDistUrl.length - 1] !== '/') {
  iojsDistUrl += '/'
}
var nodeDistUrl = process.env.NVM_NODEJS_ORG_MIRROR || 'http://npm.taobao.org/mirrors/node/'
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
    downloadLibs(function () {
      fs.writeFileSync(path.join(target, 'installVersion'), '9') // yolo
      console.log('node-gyp should now work for %s', process.version)
    })
  })

function downloadLibs (callback) {
  if (process.platform !== 'win32') {
    return callback()
  }

  var urls
  if (io) {
    urls = [
      iojsDistUrl + process.version + '/win-x86/iojs.lib',
      iojsDistUrl + process.version + '/win-x64/iojs.lib'
    ]
  } else {
    urls = [
      nodeDistUrl + process.version + '/node.lib',
      nodeDistUrl + process.version + '/x64/node.lib'
    ]
  }

  var count = 0
  var done = function () {
    count++
    if (count === 2) {
      callback()
    }
  }
  urls.forEach(function (url, index) {
    var arch = index === 0 ? 'ia32' : 'x64'
    console.log('Fetching windows %s lib from %s', arch, url)
    var nodeLib = path.join(process.env.HOME || process.env.USERPROFILE, '.node-gyp',
      process.version.slice(1), arch, 'node.lib')
    var parentDir = path.dirname(nodeLib)
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir)
    }
    request(url).pipe(fs.createWriteStream(nodeLib)).on('finish', function () {
      if (io) {
        // copy node.lib to iojs.lib
        var iojsLib = path.join(parentDir, 'iojs.lib')
        fs.createReadStream(nodeLib).pipe(fs.createWriteStream(iojsLib)).on('finish', done)
      } else {
        done()
      }
    })
  })
}
