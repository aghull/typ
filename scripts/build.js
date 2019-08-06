require('babel-register');

const webpack = require('webpack');
const config = require('../webpack.config.js').server;
const bundler = webpack(config);
const config2 = require('../webpack.config.js').client;
const bundler2 = webpack(config2);

bundler.run((err, stats) => {
  if (err) {
    console.error(err);
  }
  console.log(stats.toString());
});

bundler2.run((err, stats) => {
  if (err) {
    console.error(err);
  }
  console.log(stats.toString());
});
