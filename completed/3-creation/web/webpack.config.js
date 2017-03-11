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

    entry: path.resolve('./index.web.js'),

    output: {
      path: path.resolve('web/build'),
      filename: '[name].js',
      publicPath: '/'
    },

    resolve: {
      alias: {
        'react-native': 'react-native-web'
      }
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: 'template.html'
      }),
      new Webpack.DefinePlugin({
        process: {
          env: {
            NODE_ENV : JSON.stringify(IS_DEV ? 'development' : 'production'),
            API_URL  : JSON.stringify(process.env.API_URL)
          }
        }
      })
    ],

    module: {
      rules: [{
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }]
    },

    devServer: {
      contentBase: path.resolve('build'),
      publicPath: '/',
      port: process.env.CLIENT_PORT
    }
  }
}
