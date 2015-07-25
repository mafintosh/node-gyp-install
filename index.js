#!/usr/bin/env node

var request = require('request')
var map = require('tar-map-stream')
var tar = require('tar-fs')
var zlib = require('zlib')
var fs = require('fs')
var path = require('path')
var pump = require('pump')
var after = require('after-all')

module.exports = install

function install (opts, cb) {
  if (typeof opts === 'function') return install(null, opts)
  if (!opts) opts = {}
  if (!cb) cb = noop

  var log = opts.log || noop
  var version = opts.version || process.version
  if (version[0] !== 'v') version = 'v' + version

  var nightly = opts.nightly !== undefined ? opts.nightly : version.indexOf('nightly') > -1
  var io = opts.iojs !== undefined ? opts.iojs : process.execPath.indexOf('iojs') !== -1
  var platform = opts.platform || process.platform

  var defaultIojsUrl = nightly ? 'https://iojs.org/download/nightly/' : 'https://iojs.org/dist/'
  var iojsDistUrl = pad(process.env.NVM_IOJS_ORG_MIRROR || defaultIojsUrl)
  var nodeDistUrl = pad(process.env.NVM_NODEJS_ORG_MIRROR || 'https://nodejs.org/dist/')

  var url = io ?
    iojsDistUrl + version + '/iojs-' + version + '.tar.gz' :
    nodeDistUrl + version + '/node-' + version + '.tar.gz'

  var target = path.join(process.env.HOME || process.env.USERPROFILE, '.node-gyp', version.slice(1))

  fs.exists(path.join(target, 'installVersion'), function (exists) {
    if (exists && !opts.force) {
      log('Header files already fetched')
      log('node-gyp should now work for ' + version)
      return cb(null)
    }

    log('Fetching header files from ' + url)
    pump(request(url), zlib.createGunzip(), map(mapEntry), tar.extract(target, {strip: 1}), function (err) {
      if (err) return cb(err)
      fetchWindows(function (err) {
        if (err) return cb(err)
        fs.writeFile(path.join(target, 'installVersion'), '9', function (err) {
          if (err) return cb(err)
          log('node-gyp should now work for ' + version)
          cb()
        })
      })
    })
  })

  function mapEntry (entry) {
    return /(\.gypi$)|(\.h$)/.test(entry.name) ? entry : null
  }

  function fetchWindows (cb) {
    if (platform !== 'win32') return cb()

    var urls = io ? [
      iojsDistUrl + version + '/win-x86/iojs.lib',
      iojsDistUrl + version + '/win-x64/iojs.lib'
    ] : [
      nodeDistUrl + version + '/node.lib',
      nodeDistUrl + version + '/x64/node.lib'
    ]

    var next = after(cb)

    urls.forEach(function (url, index) {
      var arch = index === 0 ? 'ia32' : 'x64'
      var lib = path.join(target, arch, io ? 'iojs.lib' : 'node.lib')
      var parentDir = path.dirname(lib)
      var done = next()

      log('Fetching windows ' + arch + ' lib from ' + url)
      fs.mkdir(parentDir, function () {
        pump(request(url), fs.createWriteStream(lib), done)
      })
    })
  }
}

function pad (url) {
  return url[url.length - 1] === '/' ? url : url + '/'
}

function noop () {}
