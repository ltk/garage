const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

module.exports = function (env) {
  return {
    devtool: env === 'production' ? 'source-map' : 'inline-source-map',
    entry: path.resolve('./index.web.js'),
    output: {
      path: path.resolve('web/build'),
      filename: '[name].js'
    },
    resolve: {
      alias: {
        'react-native': 'react-native-web'
      }
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'web/template.html'
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
      contentBase: path.resolve('www/build')
    }
  }
}
