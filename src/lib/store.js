import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

import Game from '../testgame.js';
import DevTools from './devTools';

const game = window.game = new Game();
game.start();

const enhancer = __DEVELOPMENT__ ?
  compose(
    applyMiddleware(thunk),
    DevTools.instrument()
  )
    :
  compose(
    applyMiddleware(thunk)
  );

function configureStore(initialState) {
  return createStore(game._reducer.bind(game), initialState, enhancer);
}

const store = configureStore();

export default store;
