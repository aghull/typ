import React, { Component } from 'react';
import GameElement from '../GameElement.js';
import xmlFormat from 'xml-formatter';

export default class Page extends Component {
  state = {}

  choice(action) {
    return action.args && action.args.length && action.args.slice(-1)[0];
  }

  description(action) {
    return `${action.type} ${this.choice(action) || ''}`.trim();
  }

  renderGameElement(el) {
    const element = new GameElement(el); // pull out attr code?
    const action = this.props.actions.find(
      a => this.choice(a) === `GameElement(${JSON.stringify(element.branch())})` // pull out serialize?
    );
    return React.DOM.div(
      Object.assign(
        { id: element.name, className: element.type, key: element.branch() },
        (action ? { className: `${element.type} selectable`, onClick: () => this.props.dispatch(action) } : {}),
        element.attributes('data-')
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
          {this.props.actions.map(
            action => <input key={this.description(action)} type="button" onClick={() => this.props.dispatch(action)} value={this.description(action)} />
          )}
        </div>
        <pre>{JSON.stringify(this.props.state)}</pre>
        <pre>{xmlFormat(this.props.board.outerHTML)}</pre>
        <div>
          board().<input value={this.state.debug || ''} type="text" onChange={e => this.setState({ debug: e.target.value })} />
          <input type="submit" onClick={() => this.props.dispatch({ type: 'debug', expr: this.state.debug })} />
        </div>
        <pre>{String(this.props._debugOutput)}</pre>
      </div>
    );
  }
}
