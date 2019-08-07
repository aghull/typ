const path = require('path')

module.exports = {
  mode: process.env['BUILD_MODE'] || 'development',
  output: {
    path: path.join(__dirname + '/dist'),
    filename: 'client.js',
    publicPath: '/',
  },
  entry: './src/game/client.js',
  target: 'web',
  stats: {
    colors: true,
    reasons: true
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.scss$/,
        use: [
          "style-loader", // creates style nodes from JS strings
          "css-loader", // translates CSS into CommonJS
          "sass-loader" // compiles Sass to CSS, using Node Sass by default
        ]
      }
    ]
  }
};
