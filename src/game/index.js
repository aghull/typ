// TODOS
// game id routing
// adjacency
// syncing xml2json2xml
// layout editor?
// multi-action control/disambiguation
// reserved space/piece names?
// error catching? mark priv?
// animation
// orientation

// OBJECTS
// action = { type, args }
// choice = { answers, multi[num, max] }
// result = boolean or choice
// question = action + choice

import { times, fromJSOrdered, serialize, deserialize } from './utils.js';
import GameElement from './GameElement.js';
import GameDocument from './GameDocument.js';

export default class Game {
  constructor() {
    this.state = fromJSOrdered(this.initialState());
    this._previousState = [];
    this.doc = new GameDocument(null, this);
    this.board = this.doc.board();
    this.pile = this.doc.pile();
    this.setup();
  }

  state = () => this.state.toJS()
  get = key => {
    const value = this.state.get(key);
    return value && value.toJS ? value.toJS() : value;
  }
  set = (key, value) => (this.state = this.state.set(key, fromJSOrdered(value))) && true
  setIn = (keyPath, value) => (this.state = this.state.setIn(keyPath, fromJSOrdered(value))) && true
  update = (...args) => (this.state = this.state.update(...args)) && true
  updateIn = (...args) => (this.state = this.state.updateIn(...args)) && true
  delete = key => (this.state = this.state.delete(key)) && true

  initialState() {
    return {};
  }

  setup() {}

  victory() {}

  hidden() { return null; }

  start() {
    this.player = 0;
    this.players = times(this.numPlayers).map(p => `Player ${p + 1}`);
  }

  endTurn() {
    this.player = (this.player + 1) % this.numPlayers;
    return true;
  }

  eachPlayer = fn => times(this.numPlayers).forEach(fn)
  me = () => this.players[this.player];

  _store = () => ({
    questions: this._questions(),
    players: this.players,
    player: this.player,
    board: this._playerView(),
    pile: this.doc.pileNode(),
    state: this.state.toJS(),
    victory: this.victory(),
  });

  _playerView() {
    const playerView = this.doc.clone();
    playerView.findNodes(this.hidden()).forEach(n => n.replaceWith(document.createElement(n.nodeName)));
    return playerView.boardNode();
  }

  // multi: num, max
  // try partial action -> result
  choose(answer, answerObjects, fn, multiFn) {
    const answers = answerObjects.map(serialize);
    if (multiFn) {
      const multi = fn;
      if (!answer) return { answers, multi };
      const answerSet = (answer instanceof Array) ? new Set(answer.map(serialize).filter(c => answers.indexOf(c) > -1)) : new Set();
      return ((multi.num === undefined || answerSet.size >= multi.num) &&
              answerSet.size <= (multi.max === undefined ? multi.num : multi.max)) ? multiFn() : false;
    }
    return answers.indexOf(serialize(answer)) > -1 ? fn() : { answers, multi: { num: 1 } };
  }

  // action -> result
  _performMove(action) {
    if (!this.moves[action.type]) return false;
    const result = this.moves[action.type](...action.args.map(c =>
      deserialize(c, { GameElement: GameElement.deserialize.bind(this, this.doc) })
    ));
    if (typeof result !== 'boolean' && (typeof result !== 'object' || result.answers === undefined || result.multi === undefined)) {
      throw Error(`"${action.type}" returned invalid result "${result}"`);
    }
    return result;
  }

  // compile questions from all available actions
  _questions() {
    const actions = this.nextAction().map(type => ({ type, args: [] }));
    return actions.map(action => {
      this._doc = this.doc.clone();
      this._state = this.state;
      this._player = this.player;
      const result = this._performMove(action);
      this.doc = this._doc;
      this.board = this.doc.board();
      this.pile = this.doc.pile();
      this.state = this._state;
      this.player = this._player;
      if (result === false) return null;
      return result === true ? { action } : { action, choice: result };
    });
  }

  reducer(state = this._store(), action) {
    if (action.type === 'undo') {
      const previousState = this._previousState.pop();
      this.state = fromJSOrdered(previousState.state);
      this.doc.node.replaceChild(previousState.board, this.doc.boardNode());
      this.doc.node.replaceChild(previousState.pile, this.doc.pileNode());
      this.board = this.doc.board();
      this.pile = this.doc.pile();
      return previousState;
    }

    this._previousState.push(Object.assign({}, state, { board: state.board.cloneNode(true) }));

    if (action && this.moves[action.type]) {
      const result = this._performMove(action);
      if (result === true) {
        return this._store();
      }
      // return next question for this action
      if (result !== false) {
        return Object.assign({}, state, { questions: [{ action, choice: result }] });
      }
    }
    let _debugOutput = '';
    switch (action.type) {
      case 'debug':
        try {
          _debugOutput = eval(`this.board().${action.expr}`); // eslint-disable-line no-eval
        } catch (e) {
          _debugOutput = e;
        }
        return Object.assign(this._store(), { _debugOutput });
      default:
    }
    return state;
  }
}
