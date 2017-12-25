// replace react Component
// layout editor?
// debug mode
// multi-action control/disambiguation
// reserved space/piece names?
// error catching?

// action {type: method, choices: []} ser/deser choices
// only inside action is deser
import { times, fromJSOrdered } from './utils.js';
import BoardElement from './BoardElement.js';

export default class Game {
  constructor() {
    this._syncedState = fromJSOrdered(this.initialState());
    this.players = times(this._syncedState.get('players'));
    this._syncedDoc = document.createElement('game');
    this._addBoardElement('board', 'board', 'space', this._syncedDoc, {});
    this._addBoardElement('pile', 'pile', 'space', this._syncedDoc, {});
  }

  start() {
    this.revertToSyncedState();
    this.clearAction();
  }

  clearAction = () => (this._action = { type: null, choices: [] })

  revertToSyncedState() {
    this._state = this._syncedState;
    this._doc = this._syncedDoc.cloneNode(true);
  }

  syncState() {
    this._syncedState = this._state;
    this._syncedDoc = this._doc;
    this.clearAction();
  }

  victory() {
    return false;
  }

  _store = () => ({
    board: this._doc.firstElementChild,
    state: this._state.toJS(),
    actions: this.ask(),
    victory: this.victory(),
  });

  // needed?
  transform = fn => {
    this._state = fn(this._state);
    return true;
  }

  choose = (choice, choices, fn) => (choices.find(c => this.serializeChoice(c) === this.serializeChoice(choice)) ? fn() : choices.map(c => this.serializeChoice(c)))

  endTurn = () => this.transform(s => s.update('player', p => p % s.get('players') + 1))

  player = () => this._state.get('player')

  numPlayers = () => this._state.get('players')

  try(action) {
    const result = this._performMove(action);
    this.revertToSyncedState();
    return result;
  }

  submit(action) {
    if (this._performMove(action) === true) {
      this.syncState();
    }
  }

  // remove action args
  _performMove(action) {
    if (!this.moves[action]) return false;
    this.revertToSyncedState();
    const result = this.moves[action].apply(this, this._action.choices.map(c => this.deserializeChoice(c)));
    if (result !== true && result !== false && (typeof result !== 'object' || !result.map)) {
      throw Error(`"${action}" returned invalid result "${result}"`);
    }
    return result;
  }

  ask() {
    const moves = this._action.type ? [this._action.type] : this.nextAction();
    return moves.reduce((actions, type) => {
      const result = this.try(type);
      if (result === false) return actions;
      return actions.concat(
        result === true ?
        { type, choices: this._action.choices } :
        result.map(choice => ({ type, choices: this._action.choices.concat(choice) }))
      );
    }, []);
  }

  serializeChoice(value) {
    if (value instanceof BoardElement) {
      return `BoardElement(${JSON.stringify(value.branch())})`;
    }
    return `literal(${JSON.stringify(value)})`;
  }

  deserializeChoice(value) {
    const match = value.match(/^(\w*)\((.*)\)$/);
    if (!match) throw Error(`deserializeChoice(${value}) failed`);
    const [className, json] = match.slice(1);
    const args = JSON.parse(json);
    if (className === 'BoardElement') {
      return this.find(args.reduce((path, index) => `${path} > *:nth-child(${index})`, 'game'), null);
    }
    return args;
  }

  find(q, on = 'board') {
    if (q instanceof BoardElement) return q;
    const node = this._doc.querySelector(`${on || ''} ${q}`);
    return node ? new BoardElement(node) : null;
  }

  findAll(q, on = 'board') {
    if (q instanceof Array) return q;
    const nodes = this._doc.querySelectorAll(`${on || ''} ${q}`);
    return Array.from(nodes).map(node => new BoardElement(node));
  }

  count(q, on = 'board') {
    return this.findAll(q, on).length;
  }

  move(q, space, num = null, from = 'board', to = 'board') {
    const destination = this.find(space, to);
    let pieces = destination && destination.isSpace ? this.findAll(q, from).filter(el => el.isPiece) : [];
    if (num !== null) pieces = pieces.slice(0, num);
    pieces.forEach(el => destination._node.insertBefore(el._node, null));
    return pieces;
  }

  place(q, space, num = 1) {
    return this.move(q, space, num, 'pile', 'board');
  }

  remove(q, num = null) {
    return this.move(q, '', num, 'board', 'pile');
  }

  addSpace = (name, type, attrs = {}) => this._addBoardElement(name, type, 'space', this._syncedDoc.children[0], attrs)

  addPiece = (name, type, attrs = {}) => this._addBoardElement(name, type, 'piece', this._syncedDoc.children[1], attrs)

  _addBoardElement(name, type, className, container, attrs) {
    const el = document.createElement(type);
    el.id = name;
    el.className = className;
    Object.keys(attrs).forEach(attr => el.setAttribute(attr, attrs[attr]));
    container.appendChild(el);
  }

  _reducer(state = this._store(), action) {
    if (action && this.moves[action.type]) {
      this._action = action;
      this.submit(this._action.type);
    }
    return this._store();
  }
}
