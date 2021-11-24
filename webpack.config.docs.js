const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  entry: path.resolve(__dirname, 'examples/index'),
  output: {
    path: path.resolve(__dirname, 'docs'),
    publicPath: '',
  },
  target: 'web',
  mode: 'production',
  devtool: 'source-map',
  stats: 'errors-only',
  plugins: [
    new HtmlWebpackPlugin(),
    new CleanWebpackPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.tsx$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.js'],
    alias: {
      'react-fetch-hoc': path.resolve(__dirname),
    },
  },
}
