const Webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

// Pull in environment variables. We use these to pass along
// where to find the Garage API
require('dotenv').config({ path: './.env' })

module.exports = function (env) {
  const IS_DEV = env !== 'production'

  return {
    context: __dirname,

    devtool: 'source-map',

    entry: {
      'client': './boot.js'
    },

    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'build'),
      publicPath: '/'
    },

    module: {
      loaders: [{
        test: /\.jsx*/,
        loader: 'babel-loader',
        exclude: [/node_modules/]
      }]
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: 'index.html'
      }),
      new Webpack.DefinePlugin({
        process: {
          env: {
            NODE_ENV  : JSON.stringify(IS_DEV ? 'development' : 'production'),
            API_URL   : JSON.stringify(process.env.API_URL),
            POLL_TIME : JSON.stringify(process.env.POLL_TIME)
          }
        }
      })
    ],

    devServer: {
      contentBase: __dirname,
      publicPath: '/',
      port: process.env.CLIENT_PORT
    }
  }
}
