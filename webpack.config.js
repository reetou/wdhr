const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require('terser-webpack-plugin');


const htmlWebpackOptions = {
  title: `WDHR`,
  filename: 'index.html',
  template: 'template_index.html'
}

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  optimization: {
    minimizer: [new TerserPlugin()],
  },
  plugins: [new HtmlWebpackPlugin(htmlWebpackOptions), new MiniCssExtractPlugin()],
  module: {
    rules: [
      { test: /\.png$/, use: 'file-loader' },
      { test: /\.js$/, use: 'babel-loader' },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          "css-loader"
        ]
      },
      {
        test: /\.sass$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        })
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        })
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'less-loader']
        })
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist_wb'),
    filename: 'foo.bundle.js'
  },
  node: {
    console: false,
    global: true,
    process: true,
    fs: 'empty',
    __filename: 'mock',
    __dirname: 'mock',
    Buffer: true,
    setImmediate: true

    // See "Other node core libraries" for additional options.
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist_wb'),
    compress: true,
    port: 9000,
    historyApiFallback: true,
    after: function(app, server) {
      // do fancy stuff
      console.log(`Started lol`)
    }
  }
};