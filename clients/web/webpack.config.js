require('dotenv').config({ path: '../../.env' })

const Webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { resolve } = require('path')

const PORT = process.env.CLIENT_PORT || 4000
const API_URL = 'http://' + process.env.API_HOST + ':' + process.env.API_PORT

module.exports = function (env) {
  let isDev = env !== 'production'

  process.env.BABEL_ENV = isDev ? 'development' : 'production'

  let config = {

    devtool: 'source-map',

    entry: {
      'client': './src/boot.js'
    },

    output: {
      filename: '[name].[hash].js',
      path: resolve('build'),
      publicPath: '/'
    },

    module: {
      loaders: [{
        test: /\.jsx*/,
        loader: 'babel-loader',
        exclude: [/node_modules/],
        options: {
          cacheDirectory: '.babel-cache'
        }
      }]
    },

    plugins: [
      new Webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
        'process.env.API_URL': JSON.stringify(API_URL)
      }),
      new HtmlWebpackPlugin({
        inject: true,
        template: './public/index.html'
      }),
      new Webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: function (module) {
          var context = module.context

          if (context == null) {
            return false
          }

          return context.includes('node_modules')
        }
      })
    ],

    node: {
      global: true,
      console: false,
      process: false,
      Buffer: false,
      __filename: "mock",
      __dirname: "mock",
      setImmediate: false
    },

    devServer: {
      hot: isDev,
      contentBase: resolve('build'),
      publicPath: '/',
      compress: true,
      noInfo: true,
      historyApiFallback: true,
      port: PORT
    }
  }

  if (isDev) {
    config.devtool = 'cheap-module-inline-source-map'

    config.entry['dev'] = [
      'react-hot-loader/patch',
      'webpack-dev-server/client?http://localhost:' + PORT,
      'webpack/hot/only-dev-server'
    ]

    config.plugins.unshift(
      new Webpack.HotModuleReplacementPlugin(),
      new Webpack.NamedModulesPlugin()
    )
  }

  return config
}
