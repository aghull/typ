// TODOS
// serialize responsibility? how context for deser
// replace react Component
// syncing xml2json2xml
// layout editor?
// debug mode
// multi-action control/disambiguation
// reserved space/piece names?
// error catching?
// animation
// orientation

import { times, fromJSOrdered } from './utils.js';
import GameElement from './GameElement.js';
import GameDocument from './GameDocument.js';

export default class Game {
  constructor() {
    this._state = fromJSOrdered(this.initialState());
    this.setup();
  }

  doc = () => this._scratchDoc || this._doc || (this._doc = new GameDocument());
  board = () => this.doc().board()
  pile = () => this.doc().pile()

  initialState() {
    return {};
  }

  setup() {}

  start() {
    this.player = 1;
  }

  eachPlayer = fn => times(this.numPlayers).forEach(fn)

  victory() {
    return false;
  }

  _store = () => ({
    board: this.doc().boardNode(),
    player: this.player,
    state: this._state.toJS(),
    actions: this.ask(),
    victory: this.victory(),
  });

  transform(fn) {
    if (this._scratchState) {
      this._scratchState = fn(this._scratchState);
    } else {
      this._state = fn(this._state);
    }
    return true;
  }

  endTurn() {
    this.player = this.player % this.numPlayers + 1;
    return true;
  }

  choose = (choice, choices, fn) => (choices.find(c => this.serializeChoice(c) === this.serializeChoice(choice)) ? fn() : choices.map(c => this.serializeChoice(c)))

  _performMove(action) {
    if (!this.moves[action.type]) return false;
    const result = this.moves[action.type].apply(this, action.args.map(c => this.deserializeChoice(c)));
    if (result !== true && result !== false && (typeof result !== 'object' || !result.map)) {
      throw Error(`"${action.type}" returned invalid result "${result}"`);
    }
    return result;
  }

  try(action) {
    this._scratchDoc = this.doc().clone();
    this._scratchState = this._state;
    const result = this._performMove(action);
    this._scratchDoc = null;
    this._scratchState = null;
    return result;
  }

  ask() {
    const actions = this.nextAction().map(a => ({ type: a, args: [] }));
    return actions.reduce((choices, a) => {
      const result = this.try(a);
      if (result === false) return choices;
      return choices.concat(result === true ? a : result.map(choice => ({ type: a.type, args: [choice] })));
    }, []);
  }

  serializeChoice(value) {
    if (value instanceof GameElement) {
      return `GameElement(${JSON.stringify(value.branch())})`;
    }
    return `literal(${JSON.stringify(value)})`;
  }

  deserializeChoice(value) {
    const match = value.match(/^(\w*)\((.*)\)$/);
    if (!match) throw Error(`deserializeChoice(${value}) failed`);
    const [className, json] = match.slice(1);
    const args = JSON.parse(json);
    if (className === 'GameElement') {
      return this.doc().find(args.reduce((path, index) => `${path} > *:nth-child(${index})`, 'game'), null);
    }
    return args;
  }

  reducer(state = this._store(), action) {
    if (action && this.moves[action.type]) {
      const result = this._performMove(action);
      if (result === true) {
        return this._store();
      }
      // return next choices for this action
      return Object.assign({}, state, { actions: result.map(choice => ({ type: action.type, args: action.args.concat(choice) })) });
    }
    switch (action.type) {
      case 'debug':
        return Object.assign(this._store(), { _debugOutput: eval(`this.board().${action.expr}`) }); // eslint-disable-line no-eval
      default:
    }
    return state;
  }
}
