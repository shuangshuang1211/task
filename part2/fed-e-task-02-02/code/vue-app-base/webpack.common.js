const path = require('path');
const { DefinePlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

const { merge } = require('webpack-merge');

const prodConfig = require('./webpack.prod');
const devConfig = require('./webpack.dev');

// const appDir = process.cwd();
// const resolveApp = (relativePath) => {
//   return path.resolve(appDir, relativePath);
// };

// console.log('__dirname', __dirname, 'process.cwd()', process.cwd());

const commonConfig = (isProduction) => ({
  entry: './src/main.js',
  output: {
    filename: 'js/[name].[contenthash:8].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  optimization: {
    runtimeChunk: true
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              esModule: false
            }
          },
          'postcss-loader'
        ]
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'less-loader'
        ]
      },
      {
        test: /\.(png|svg|gif|jpe?g)$/,
        type: 'asset',
        generator: {
          filename: "img/[name].[hash:4][ext]"
        },
        parser: {
          dataUrlCondition: {
            maxSize: 30 * 1024
          }
        }
      },
      {
        test: /\.(ttf|woff2?)$/,
        type: 'asset/resource',
        generator: {
          filename: 'font/[name].[hash:3][ext]'
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.jsx?$/,
        use: ['babel-loader']
      },
      {
        test: /\.ts$/,
        use: ['babel-loader']
      },
      {
        test: /\.vue$/,
        use: ['vue-loader']
      },
      // {
      //   test: /\.js$/, 
      //   exclude: /node_modules/, 
      //   use: 'eslint-loader',
      //   enforce: "pre"
      // },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'webpackBuildLearn',
      template: './public/index.html'
    }),
    new DefinePlugin({
      BASE_URL: '"./"'
    }),
    new VueLoaderPlugin()
  ]
});
module.exports = (env) => {
  const isProduction = env.production;
  console.log('===>' , env);
  const config = isProduction ? prodConfig : devConfig;
  const mergeConfig = merge(commonConfig(isProduction), config);
  return mergeConfig;
}