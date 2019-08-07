const path = require('path')

module.exports = {
  mode: process.env['BUILD_MODE'] || 'development',
  output: {
    path: path.join(__dirname + '/dist'),
    filename: 'server.js',
    publicPath: '/',
    library: 'TicTacToe',
    libraryTarget: 'commonjs2',
  },
  entry: './src/game/tttserver.js',
  target: 'node',
  stats: {
    colors: true,
    reasons: true
  },
  module: {
    rules: [
      {
        test: /\.node$/,
        use: 'node-loader'
      },
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
