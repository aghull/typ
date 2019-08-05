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
  constructor(player, postAction) {
    this.doc = new GameDocument(null, this);
    this.player = player;
    this.postAction = postAction;
  }

  start() {
    this.setState({ meta: this.initialMeta() });
    this.setup();
    return this.getState();
  }

  endTurn() {
    this.player = (this.player + 1) % this.numPlayers;
    // call server endTurn
    return true;
  }

  setState(state) {
    this.meta = fromJSOrdered(state.meta) || {};
    if (state.board) {
      this.doc.node.replaceChild(state.board.cloneNode(true), this.doc.boardNode());
    }
    if (state.pile) {
      this.doc.node.replaceChild(state.pile.cloneNode(true), this.doc.pileNode());
    }
    this.board = this.doc.board();
    this.pile = this.doc.pile();
  }

  getPlayerState = () => Object.assign({}, this.getState(), { board: this.playerView() });

  getState = () => ({
    board: this.doc.boardNode(),
    pile: this.doc.pileNode(),
    meta: this.meta.toJS(),
  });

  serializedState() {
    const state = this.getState();
    state.board = state.board.outerHTML;
    state.pile = state.pile.outerHTML;
    return state;
  }

  deserializedState(state) {
    return {
      meta: state.meta,
      board: new DOMParser().parseFromString(state.board, 'text/html').body.children[0],
      pile: new DOMParser().parseFromString(state.pile, 'text/html').body.children[0],
    };
  }

  receiveAction(action) {
    if (action && this.moves[action.type]) {
      const result = this._performMove(action);
      if (result === true) {
        return this.getState();
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
        return Object.assign(this.getState(), { _debugOutput });
      default:
    }
    return this.getState();
  }

  get(key) {
    const value = this.meta.get(key);
    return value && value.toJS ? value.toJS() : value;
  }
  set = (key, value) => (this.meta = this.meta.set(key, fromJSOrdered(value))) && true
  setIn = (keyPath, value) => (this.meta = this.meta.setIn(keyPath, fromJSOrdered(value))) && true
  update = (...args) => (this.meta = this.meta.update(...args)) && true
  updateIn = (...args) => (this.meta = this.meta.updateIn(...args)) && true
  delete = key => (this.meta = this.meta.delete(key)) && true
  eachPlayer = fn => times(this.numPlayers).forEach(fn)
  me = () => this.players[this.player];

  initialMeta() {
    return {};
  }

  setup() {}

  victory() {}

  hidden() { return null; }

  playerView() {
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
}
