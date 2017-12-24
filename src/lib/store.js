import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

import game from '../game.js';
import DevTools from './devTools';

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
