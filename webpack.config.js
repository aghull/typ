import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const development = {
  output: {
    path: require('path').join(__dirname + '/dist'),
    filename: '[name].js',
    publicPath: '/'
  },
  debug: true,
  devtool: 'eval',
  entry: {
    polyfill: 'eventsource-polyfill',
    hot: 'webpack-hot-middleware/client',
    server: './src/index',
    client: './src/client',
  },
  stats: {
    colors: true,
    reasons: true
  },
  resolve: {
    extensions: ['', '.js'],
  },
  module: {
    preLoaders: [{
      test: /\.js$/,
      exclude: [/node_module/, 'mock/*'],
      loader: 'eslint'
    }],
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel',
      options: {
        presets: ["env", {
          "targets": { "chrome": 62 }
        }]
      }
    }, {
      test: /\.scss/,
      exclude: [/node_module/],
      loader: 'style!css?localIdentName=[path][name]---[local]---[hash:base64:5]!postcss'
    }, {
      test: /\.css/,
      exclude: [/node_module/],
      loader: 'style!css'
    }, {
      test: /\.(png|jpg|woff|woff2)$/,
      loader: 'url?limit=8192'
    }]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      __DEVELOPMENT__: true
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html.tpl',
      inject: 'body',
      chunks: ['polyfill', 'hot', 'server'],
      filename: 'server.html',
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html.tpl',
      inject: 'body',
      chunks: ['polyfill', 'hot', 'client'],
      filename: 'client.html',
    }),
  ],
  postcss() {
    return [
      require("postcss-import")({addDependencyTo: webpack}),
      require("postcss-url")(),
      require("postcss-cssnext")(),
      require('precss'),
      require("postcss-browser-reporter")(),
      require("postcss-reporter")()
    ];
  }
};

const production = {
  output: {
    path: require('path').join(__dirname + '/dist'),
    filename: '[name].js',
    publicPath: '/'
  },
  devtool: 'sourcemap',
  entry: {
    server: './src/games/tictactoe/index',
    client: './src/games/tictactoe/Page',
  },
  stats: {
    colors: true,
    reasons: true
  },
  resolve: {
    extensions: ['', '.js'],
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel'
    }, {
      test: /\.scss/,
      exclude: [/node_module/],
      loader: 'style!css!postcss'
    }, {
      test: /\.css/,
      exclude: [/node_module/],
      loader: 'style!css'
    }, {
      test: /\.(png|jpg|woff|woff2)$/,
      loader: 'url?limit=8192'
    }]
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      __DEVELOPMENT__: false
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html.tpl',
      inject: 'body'
    })
  ],
  postcss() {
    return [
      require("postcss-import")({addDependencyTo: webpack}),
      require("postcss-url")(),
      require("postcss-cssnext")(),
      require('precss'),
      require("postcss-browser-reporter")(),
      require("postcss-reporter")()
    ];
  }
};

module.exports = { development, production };
