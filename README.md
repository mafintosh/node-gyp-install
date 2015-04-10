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
# assuming you are using iojs
node-gyp-install
npm install level # does not explode \o/
```

### Download From Mirrors

To use a mirror of the node/iojs header files, set `$NVM_NODEJS_ORG_MIRROR` and `$NVM_IOJS_ORG_MIRROR`.

Take an exapmle for users from China:

``` sh
export NVM_NODEJS_ORG_MIRROR=http://npm.taobao.org/mirrors/node
export NVM_IOJS_ORG_MIRROR=http://npm.taobao.org/mirrors/iojs
```

## License

MIT
