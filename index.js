#!/usr/bin/env node

var get = require('simple-get')
var map = require('tar-map-stream')
var tar = require('tar-fs')
var zlib = require('zlib')
var fs = require('fs')
var path = require('path')
var pump = require('pump')
var after = require('after-all')
var multi = require('multi-write-stream')
var semver = require('semver')

module.exports = install

function install (opts, cb) {
  if (typeof opts === 'function') return install(null, opts)
  if (!opts) opts = {}
  if (!cb) cb = noop

  var log = opts.log
  var version = opts.version || process.version
  if (version[0] !== 'v') version = 'v' + version

  var nightly = opts.nightly !== undefined ? opts.nightly : version.indexOf('nightly') > -1
  var io = opts.iojs !== undefined ? opts.iojs : iojsVersion(version)
  var platform = opts.platform || process.platform

  var defaultIojsUrl = nightly ? 'https://iojs.org/download/nightly/' : 'https://iojs.org/dist/'
  var iojsDistUrl = pad(process.env.NVM_IOJS_ORG_MIRROR || defaultIojsUrl)
  var nodeDistUrl = pad(process.env.NVM_NODEJS_ORG_MIRROR || 'https://nodejs.org/dist/')

  var url = io ?
    iojsDistUrl + version + '/iojs-' + version + '.tar.gz' :
    nodeDistUrl + version + '/node-' + version + '.tar.gz'

  var target = path.join(process.env.HOME || process.env.USERPROFILE, '.node-gyp', version.slice(1))

  exists(function (err) {
    if (!err && !opts.force) {
      if (log) log.info('install', 'Header files already fetched')
      if (log) log.info('install', 'node-gyp should now work for ' + version)
      return cb(null)
    }

    if (log) log.http('request', url)
    get(url, function (err, res) {
      if (err) return cb(err)
      if (log) log.http(res.statusCode, url)
      pump(res, zlib.createGunzip(), map(mapEntry), tar.extract(target, {strip: 1}), function (err) {
        if (err) return cb(err)
        fetchWindows(function (err) {
          if (err) return cb(err)
          fs.writeFile(path.join(target, 'installVersion'), '9', function (err) {
            if (err) return cb(err)
            if (log) log.info('install', 'node-gyp should now work for ' + version)
            cb()
          })
        })
      })
    })
  })

  function exists (cb) {
    fs.exists(path.join(target, 'installVersion'), function (exists) {
      if (!exists) return cb(new Error('missing installVersion'))
      fs.exists(path.join(target, 'common.gypi'), function (exists) {
        cb(exists ? null : new Error('missing common.gypi'))
      })
    })
  }

  function mapEntry (entry) {
    return /(\.gypi$)|(\.h$)/.test(entry.name) ? entry : null
  }

  function fetchWindows (cb) {
    if (platform !== 'win32') return cb()

    var urls
    if (io) {
      urls = [
        iojsDistUrl + version + '/win-x86/iojs.lib',
        iojsDistUrl + version + '/win-x64/iojs.lib'
      ]
    } else if (semver.satisfies(version, '>=4.0.0')) {
      urls = [
        nodeDistUrl + version + '/win-x86/node.lib',
        nodeDistUrl + version + '/win-x64/node.lib'
      ]
    } else {
      urls = [
        nodeDistUrl + version + '/node.lib',
        nodeDistUrl + version + '/x64/node.lib'
      ]
    }

    var next = after(cb)

    urls.forEach(function (url, index) {
      var arch = index === 0 ? 'ia32' : 'x64'
      var nodeLib = path.join(target, arch, 'node.lib')
      var ioLib = path.join(target, arch, 'iojs.lib')
      var parentDir = path.dirname(nodeLib)
      var done = next()

      if (log) log.http('request', url)
      fs.mkdir(parentDir, function () {
        get(url, function (err, res) {
          if (err) return done(err)
          log.http(res.statusCode, url)
          pump(res, multi([fs.createWriteStream(nodeLib), fs.createWriteStream(ioLib)]), done)
        })
      })
    })
  }
}

function iojsVersion (v) {
  return semver.satisfies(v, '>=1.0.0 <4.0.0')
}

function pad (url) {
  return url[url.length - 1] === '/' ? url : url + '/'
}

function noop () {}
