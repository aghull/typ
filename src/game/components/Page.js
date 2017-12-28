import React, { Component } from 'react';
import GameElement from '../GameElement.js';
import xmlFormat from 'xml-formatter';
import classNames from 'classnames';
import Piece from './Piece';

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
    if (this.checkMulti(action, (_, num, max) => num > 1 || max > 1)) {
      this.setState(state => {
        if (!state.action) {
          const newState = Object.assign(state, { action });
          newState.action.args.push([newState.action.args.pop()]);
          return newState;
        }
        const lastArg = state.action.args[state.action.args.length - 1];
        const index = lastArg.indexOf(this.choice(action));
        if (index > -1) {
          lastArg.splice(index, 1);
          if (lastArg.length === 0) {
            return Object.assign(state, { action: undefined });
          }
        } else {
          lastArg.push(this.choice(action));
        }
        return state;
      });
    } else {
      this.submit(action);
    }
  }

  checkMulti(action, fn) {
    if (!action || !action.multi) return false;
    const num = action.multi.num === undefined ? 1 : action.multi.num;
    const max = action.multi.max === undefined ? action.multi.num : action.multi.max;
    const answers = new Set(this.choice(action)).size;
    return fn(answers, num, max);
  }

  submissions() {
    if (this.state.action) {
      return this.checkMulti(this.state.action, (answers, num, max) => answers >= num && answers <= max) ? [''] : [];
    }
    return this.actions().filter(a => !a.args || !a.args.length);
  }

  submit(action) {
    this.props.dispatch(action || this.state.action);
    this.setState({ action: null });
  }

  choice(action) {
    return action && action.args && action.args.slice(-1)[0];
  }

  description(action) {
    return `${action.type} ${this.choice(action) || ''}`.trim();
  }

  component(element) {} // eslint-disable-line no-unused-vars

  renderGameElement(el) {
    const element = new GameElement(el); // pull out attr code?
    const choice = `GameElement(${JSON.stringify(element.branch())})`; // pull out serialize?
    const selected = (this.choice(this.state.action) || []).indexOf(choice) > -1;
    const action = (this.checkMulti(this.state.action, (answers, _, max) => answers === max) && !selected) ? null : this.actions().find(a => this.choice(a) === choice);
    const Element = this.component(element.type) || Piece;

    return (
      <Element
        id={element.name}
        key={element.branch()}
        attributes={element.attributes()}
        className={classNames(element.type, { selected, selectable: action })}
        onClick={action && (() => this.select(action))}
      >
        {GameElement.isPieceNode(el) ? element.name : Array.from(el.childNodes).map(node => this.renderGameElement(node))}
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
          {this.submissions().map(action =>
            <input key={action} type="button" onClick={() => this.submit(action)} value={action ? action.type : 'Done'} />
          )}
        </div>
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
