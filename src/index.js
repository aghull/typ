import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import DevTools from './lib/devTools';
const enhancer = __DEVELOPMENT__ ? compose(applyMiddleware(thunk), DevTools.instrument()) : compose(applyMiddleware(thunk));

import Game from './games/barbu';
const game = window.game = new Game();
game.start();

const store = createStore(game.reducer.bind(game), undefined, enhancer);

if (__DEVELOPMENT__) {
  render(
    <Provider store={store}>
      <div>
        <DevTools />
        <game.page />
      </div>
    </Provider>,
    document.getElementById('container')
  );
} else {
  render(
    <Provider store={store}>
      <game.page />
    </Provider>,
    document.getElementById('container')
  );
}
