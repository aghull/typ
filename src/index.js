import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import store from './lib/store';
import 'style!css!todomvc-app-css/index.css';
import IndexPage from 'pages/IndexPage';

if (__DEVELOPMENT__) {
  // babel export default...
  let DevTools = require('./lib/devTools');
  DevTools = DevTools.default;

  render(
    <Provider store={store}>
      <div>
        <DevTools />
        <IndexPage />
      </div>
    </Provider>,
    document.getElementById('container')
  );
} else {
  render(
    <Provider store={store}>
      <IndexPage />
    </Provider>,
    document.getElementById('container')
  );
}
