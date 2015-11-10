# node-gyp-install

Manually download node/iojs header files for usage with node-gyp.

``` sh
npm install -g node-gyp-install
```

[![build status](http://img.shields.io/travis/mafintosh/node-gyp-install.svg?style=flat)](http://travis-ci.org/mafintosh/node-gyp-install)

## Usage

To download the node/iojs header files for the node/iojs version you currently
have installed simply run

``` sh
node-gyp-install
```

Afterwards installing native modules that uses node-gyp using iojs should *just work*

``` sh
node-gyp-install
npm install level # does not explode \o/
```

Per default node-gyp-install will install header files for your current node version.
To see all available options see `node-gyp-install --help`.

### Download From Mirrors

To use a mirror of the node/iojs header files, set `$NVM_NODEJS_ORG_MIRROR` and `$NVM_IOJS_ORG_MIRROR`.

Take an example for users from China:

``` sh
export NVM_NODEJS_ORG_MIRROR=http://npm.taobao.org/mirrors/node
export NVM_IOJS_ORG_MIRROR=http://npm.taobao.org/mirrors/iojs
```

### Download From Secure Mirrors

To use private mirrors that need some https/tls configuration e.g. for client authentification you
can pass some more environment settings:

``` sh
export NODE_GYP_INSTALL_PASSPHRASE=mysecret
export NODE_GYP_INSTALL_REJECTUNAUTHORIZED=false
export NODE_GYP_INSTALL_PFX=/path/to/my/key.p12
export NODE_GYP_INSTALL_CERT=/path/to/my/cert.crt
export NODE_GYP_INSTALL_KEY=/path/to/my/key.key
export NODE_GYP_INSTALL_CA=/path/to/my/ca.crt
```

This variables refers to the according options of the https.request() function. 
Please have a look to [nodejs tls api documentation](https://nodejs.org/api/tls.html) 
for more details. 


## Programmatic usage

You can also use this as a module

``` js
var install = require('node-gyp-install')
install(function (err) {
  console.log('header files installed', err)
})
```

## License

MIT
