# A Webpack loader for replacing src and href of image, script and link tag

```js
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var path = require('path')
return {
  loader: {
    test: test,
    loader: ExtractTextPlugin.extract({
      use: {
        loader: 'jade-url-replace-loader',
        options: {
          attrs: ['img:src','script:src','link:href'],
          getEmitedFilePath: function (url) {
            if (!manifest) {
              // get filename with contenthash from manifest files
              // manifest file should be generated before hand
              var assetsRoot = path.join(__dirname, 'dist')
              var m1 = require(path.join(assetsRoot + '/manifest-js.json'))
              var m2 = require(path.join(assetsRoot + '/manifest-stylus.json'))
              var m3 = require(path.join(assetsRoot + '/manifest-img.json'))
              manifest = Object.assign({}, m1, m2, m3)
              console.log('Manifest:', manifest)
            }
            var pub = '/static/'
            var k = url.replace(pub, '')
            return pub + manifest[k]
          }
        }
      }
    })
  },
  plugins: [
    new ExtractTextPlugin('[name].jade')
  ]
}
```
