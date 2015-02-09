# node-gyp-install

Manually download node/iojs header files for usage with node-gyp.

```
npm install node-gyp-install
```

## Usage

To download the node/iojs header files for the node/iojs version you currently
have installed simply run

```
node-gyp-install
```

Afterwards installing native modules that uses node-gyp using iojs should *just work*

```
# assuming you are using iojs
node-gyp-install
npm install level # does not explode \o/
```

## License

MIT
