import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import DevTools from '../lib/devTools';

import TicTacToe from '../games/tictactoe';
import Page from '../games/tictactoe/Page';

export default class GameClient {
  constructor(player) {
    this.channel = new BroadcastChannel('game'); // eslint-disable-line no-undef
    this.player = player;
    this.currentPlayer = null;

    this.engine = new TicTacToe(this.player);

    const enhancer = __DEVELOPMENT__ ? compose(applyMiddleware(thunk), DevTools.instrument()) : compose(applyMiddleware(thunk));
    this.store = createStore(this.reducer.bind(this), undefined, enhancer);

    this.channel.onmessage = message => {
      console.log(message);
      if (message.data.type === 'state') {
        this.currentPlayer = message.data.body.player;
        this.store.dispatch({ type: 'setState', state: this.engine.deserializedState(message.data.body) });
      }
    };

    this.startRender();
  }

  startRender() {
    render(
      <Provider store={this.store}>
        <div>
          <DevTools />
          <Page postAction={this.postAction.bind(this)} join={this.join.bind(this)} />
        </div>
      </Provider>,
      document.getElementById('container')
    );
  }

  join() {
    this.channel.postMessage({ type: 'join', body: this.player });
  }

  postAction(action) {
    if (this.currentPlayer === this.player) {
      this.channel.postMessage({ type: 'action', body: action });
    } else {
      console.log('Not your turn');
    }
  }

  // compile questions from all available actions
  _questions() {
    const actions = this.engine.nextAction().map(type => ({ type, args: [] }));
    const state = this.engine.getState();
    const a = actions.map(action => {
      const tempEngine = new TicTacToe();
      tempEngine.setState(state);
      const result = tempEngine._performMove(action);
      if (result === false) return null;
      return result === true ? { action } : { action, choice: result };
    });
    return a;
  }

  _store = () => (this.currentPlayer !== null ? Object.assign({}, this.engine.getPlayerState(), {
    questions: this._questions(),
    players: this.engine.getState().meta.players,
    player: this.player,
    victory: this.engine.victory(),
  }) : {});

  reducer(state, action) {
    if (action.type === 'setState') {
      this.engine.setState(action.state);
    }
    // this.engine.receiveAction(action);
    return this._store();
  }
}
