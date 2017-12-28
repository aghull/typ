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
    this._state = fromJSOrdered(this.initialState());
    this.setup();
  }

  doc = () => this._scratchDoc || this._doc || (this._doc = new GameDocument(null, this));
  board = () => this.doc().board()
  pile = () => this.doc().pile()

  initialState() {
    return {};
  }

  setup() {}

  victory() {}

  hidden() { return null; }

  start() {
    this.player = 1;
  }

  endTurn() {
    this.player = this.player % this.numPlayers + 1;
    return true;
  }

  eachPlayer = fn => times(this.numPlayers).forEach(fn)

  transform(fn) {
    if (this._scratchState) {
      this._scratchState = fn(this._scratchState);
    } else {
      this._state = fn(this._state);
    }
    return true;
  }

  _store = () => ({
    board: this._playerView(),
    player: this.player,
    state: this._state.toJS(),
    questions: this._questions(),
    victory: this.victory(),
  });

  _playerView() {
    const playerView = this.doc().clone();
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
    const result = this.moves[action.type].apply(this, action.args.map(c =>
      deserialize(c, { GameElement: GameElement.deserialize.bind(this, this.doc()) })
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
      this._scratchDoc = this.doc().clone();
      this._scratchState = this._state;
      const result = this._performMove(action);
      this._scratchDoc = null;
      this._scratchState = null;
      if (result === false) return null;
      return result === true ? { action } : { action, choice: result };
    });
  }

  reducer(state = this._store(), action) {
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
