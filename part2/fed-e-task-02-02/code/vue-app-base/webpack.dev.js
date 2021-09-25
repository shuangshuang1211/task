module.exports = {
  mode: 'development',
  devtool: false,
  target: 'web',
  devServer: {
    hot: true,
    // static: {
    //  directory: path.join(__dirname, 'public'),
    // },
    // hotOnly: true,
    port: 4001,
    open: true,
    compress: true,
    // historyApiFallback: true
  }
};