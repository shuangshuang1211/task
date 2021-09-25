const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const PurgeCSSPlugin = require('purgecss-webpack-plugin')
const glob = require('glob');
const path = require('path');
const CompressionPlugin = require("compression-webpack-plugin");
const FileManagerPlugin = require('filemanager-webpack-plugin');

module.exports = {
  mode: 'production',
  optimization: {
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin({
        extractComments: false,
      }),
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public',
          globOptions: {
            ignore: ['**/index.html']
          }
        }
      ]
    }),
    new MiniCssExtractPlugin({
      filename: 'styles/[name].[hash:8].css'
    }),
    new FileManagerPlugin({
      events: {
        onEnd: {
          delete: [
            './dist/build.zip',
          ],
          archive: [
              {source: './dist', destination: './dist/build.zip', options: {gzip: true}},
          ]
        }
      }
    })
    // new CompressionPlugin({
    //   test: /\.(css|js)$/,
    //   minRatio: 0.8,
    //   threshold: 0,
    //   algorithm: 'gzip'
    // }),
    // new PurgeCSSPlugin({
    //   paths: glob.sync(`${path.resolve(process.cwd(), './src')}/**/*`, { nodir: true }),
    //   safelist: function () {
    //     return {
    //       standard: ['body', 'html', 'ef']
    //     }
    //   }
    // })
  ]
};