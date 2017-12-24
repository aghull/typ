import { fromJS } from 'immutable';

class Game {
  constructor() {
    this._state = this._currentState = fromJS(this.initialState());
    this.clearAction();
  }

  clearAction = () => { this._action = { choices: [] }; }

  _store = () => ({
    state: this._state.toJS(),
    question: this.ask(),
  });

  transform = fn => {
    this._state = fn(this._state);
    return true;
  }

  choose = (item, items, fn) => (items.indexOf(item) > -1 ? fn() : items)

  endTurn = () => this.transform(s => s.update('player', p => p % s.get('players') + 1))

  try(action) {
    this._state = this._currentState;
    const result = this.moves[action](...this._action.choices);
    if (result !== true && result !== false && (typeof result !== 'object' || !result.forEach)) {
      throw Error(`${action} did not return valid result ${result}`);
    }
    return result;
  }

  perform(action) {
    if (this.try(action) === true) {
      this._currentState = this._state;
      this.clearAction();
    }
  }

  ask() {
    const actions = {};
    const moves = this._action.type ? [this._action.type] : this.nextAction();
    moves.forEach(type => {
      const result = this.try(type);
      if (result === true) {
        actions[type] = { type };
      } else {
        result.forEach(choice => {
          const choices = this._action.choices.concat(choice);
          actions[`${type} ${choices.join(' ')}`] = { type, choices };
        });
      }
    });
    return actions;
  }

  _reducer(state = this._store(), action) {
    if (action && this.moves[action.type]) {
      this._action = action;
      this.perform(this._action.type);
    }
    return this._store();
  }
}

class TestGame extends Game {
  initialState() {
    return {
      board: { A: 1, B: 2, C: 3 },
      player: 1,
      players: 2,
    };
  }

  moves = {
    increment: (index, by) =>
      this.choose(index, ['A', 'B', 'C'], () =>
        this.choose(by, [1, 2, 3], () => {
          this.transform(s => s.updateIn(['board', index], a => a + by));
          return this.endTurn();
        })
      )
  }

  nextAction = () => ['increment'];
}

const game = window.game = new TestGame();

export default game;
