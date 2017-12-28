import React, { Component } from 'react';
import GameElement from '../GameElement.js';
import xmlFormat from 'xml-formatter';
import classNames from 'classnames';

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
    if (action.multi && (action.multi.num === undefined || action.multi.num > 1 || (action.multi.max !== undefined && action.multi.max > 1))) {
      this.setState(state => {
        if (!state.action) {
          const newState = Object.assign(state, { action });
          newState.action.args.push([newState.action.args.pop()]);
          return newState;
        }
        state.action.args[state.action.args.length - 1].push(this.choice(action));
        return state;
      });
    } else {
      this.submit(action);
    }
  }

  submissions() {
    if (this.state.action) {
      const multi = this.state.action.multi;
      const answerSet = new Set(this.choice(this.state.action));
      return ((multi.num === undefined || answerSet.size >= multi.num) &&
              answerSet.size <= (multi.max === undefined ? multi.num : multi.max)) ? [''] : [];
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

  renderGameElement(el) {
    const element = new GameElement(el); // pull out attr code?
    const choice = `GameElement(${JSON.stringify(element.branch())})`; // pull out serialize?
    const action = this.actions().find(a => this.choice(a) === choice);

    return React.DOM.div(
      Object.assign(
        {
          id: element.name,
          key: element.branch(),
          className: classNames(element.type, {
            selectable: action,
            selected: (this.choice(this.state.action) || []).indexOf(choice) > -1
          }),
        },
        element.attributes('data-'),
        (action ? { onClick: () => this.select(action) } : {}),
      ), GameElement.isPieceNode(el) ? element.name : Array.from(el.childNodes).map(node => this.renderGameElement(node))
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
            board().<input value={this.state.debug || ''} type="text" onChange={e => this.setState({ debug: e.target.value })} />
            <input type="submit" onClick={() => this.props.dispatch({ type: 'debug', expr: this.state.debug })} />
          </div>
          <pre>{String(this.props._debugOutput)}</pre>
        </div>
      </div>
    );
  }
}
