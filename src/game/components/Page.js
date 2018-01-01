import React, { Component } from 'react';
import GameElement from '../GameElement';
import xmlFormat from 'xml-formatter';
import classNames from 'classnames';
import Piece from './Piece';
import { deserialize } from '../utils';

import './styles.scss';

export default class Page extends Component {
  state = {}

  actions() {
    return this.props.questions.filter(q => q).reduce((choices, { action, choice }) => {
      if (!choice) return choices.concat(action);
      return choices.concat(choice.answers.map(answer => ({ type: action.type, args: action.args.concat(answer), multi: choice.multi })));
    }, []);
  }

  select(action) {
    if (this.checkMulti(action, (_, num, max) => num !== 1 || max > 1)) {
      this.setState(state => {
        let newAction = state.action || this.blank(action);
        const lastArg = newAction.args.slice(-1)[0];
        const index = lastArg.indexOf(this.choice(action));
        if (index > -1) {
          lastArg.splice(index, 1);
          if (lastArg.length === 0) newAction.args.pop();
          if (newAction.args.length === 0) newAction = undefined;
        } else {
          lastArg.push(this.choice(action));
        }
        return Object.assign(state, { action: newAction });
      });
    } else {
      this.submit(action);
    }
  }

  blank(action) {
    return Object.assign({}, action, { args: action.args.slice(0, -1).concat([[]]) });
  }

  checkMulti(action, fn) {
    if (!action || !action.multi) return false;
    const num = action.multi.num === undefined ? 1 : action.multi.num;
    const max = action.multi.max === undefined ? action.multi.num : action.multi.max;
    const answers = new Set(this.choice(action)).size;
    return fn(answers, num, max);
  }

  submittable() {
    return [this.state.action].concat(this.actions().map(a => this.blank(a))).find((action) =>
      this.checkMulti(action, (answers, num, max) => answers >= num && answers <= max)
    );
  }

  // non game element choices
  selections() {
    let selections = this.actions().filter(a => !a.args || !a.args.length || this.choice(a).match(/^literal\(/));
    if (this.state.action) {
      selections = selections.filter(a => this.choice(this.state.action).indexOf(this.choice(a)) === -1);
    }
    return selections;
  }

  submit(action) {
    this.props.dispatch(action || this.state.action);
    this.cancel();
  }

  cancel() {
    this.setState({ action: null });
  }

  choice(action) {
    return action && action.args && action.args.slice(-1)[0];
  }

  description(action) {
    return `${action.type} ${this.choice(action) ? deserialize(this.choice(action)) : ''}`.trim();
  }

  component(element) {} // eslint-disable-line no-unused-vars

  renderGameElement(el) {
    const element = new GameElement(el); // pull out attr code?
    const choice = element.serialize();
    const selected = (this.choice(this.state.action) || []).indexOf(choice) > -1;
    const action = (this.checkMulti(this.state.action, (answers, _, max) => answers === max) && !selected) ? null : this.actions().find(a => this.choice(a) === choice);
    const Element = this.component(element.type) || Piece;

    return (
      <Element
        id={element.id}
        key={element.branch()}
        attributes={element.attributes()}
        className={classNames(element.type, { selected, selectable: action, mine: element.player() === this.props.player })}
        onClick={action && (() => this.select(action))}
      >
        {GameElement.isPieceNode(el) ? element.id : Array.from(el.childNodes).map(node => this.renderGameElement(node))}
      </Element>
    );
  }

  render() {
    return (
      <div>
        <div>
          {this.renderGameElement(this.props.board)}
        </div>
        <div>Player {this.props.player}</div>
        <div>Winner {this.props.victory}</div>
        <div>
          {this.selections().map(action =>
            <input key={this.description(action)} type="button" onClick={() => this.select(action)} value={this.description(action)} />
          )}
        </div>
        {this.submittable() && <div>
          <input type="button" onClick={() => this.submit(this.submittable())} value="Done" />
          <input type="button" onClick={() => this.cancel()} value="Cancel" />
        </div>}
        <div style={{ border: '1px solid #666', padding: '6px', background: '#ccc' }}>
          <div>
            {this.actions().map(action =>
              <input key={this.description(action)} type="button" onClick={() => this.select(action)} value={this.description(action)} />
             )}
          </div>
          <div>State: <pre>{JSON.stringify(this.props.state)}</pre></div>
          <div>Action: <pre>{JSON.stringify(this.state.action)}</pre></div>
          <div>Board: <pre>{xmlFormat(this.props.board.outerHTML)}</pre></div>
          <div>
            <form onSubmit={e => e.preventDefault() || this.props.dispatch({ type: 'debug', expr: this.state.debug })}>
              board().<input value={this.state.debug || ''} type="text" onChange={e => this.setState({ debug: e.target.value })} size="80" />
              <input type="submit" />
            </form>
          </div>
          <pre>{String(this.props._debugOutput)}</pre>
        </div>
      </div>
    );
  }
}
