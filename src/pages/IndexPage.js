import React, { Component } from 'react';
import { connect } from 'react-redux';
import BoardElement from '../BoardElement.js';

import style from '../styles/main.scss';

class IndexPage extends Component {

  choice(action) {
    return action.choices && action.choices.length && action.choices.slice(-1)[0];
  }

  description(action) {
    return `${action.type} ${this.choice(action) || ''}`.trim();
  }

  renderGameElement(el, path) {
    const element = new BoardElement(el);
    const action = this.props.actions.find(
      a => this.choice(a) === `BoardElement(${JSON.stringify(path)})` // el.branch()?
    );
    return React.DOM.div(
      Object.assign(
        { id: element.name, className: element.type, key: path },
        (action ? { className: `${element.type} selectable`, onClick: () => this.props.dispatch(action) } : {}),
        Object.keys(element._attrs).reduce((attrs, attr) => Object.assign(attrs, { [`data-${attr}`]: element._attrs[attr] }), {})
      ), Array.from(el.childNodes).map((node, i) => this.renderGameElement(node, path.concat(i + 1)))
    );
  }

  render() {
    return (
      <div>
        <div className={style.board}>
          {this.renderGameElement(this.props.board, [1])}
        </div>
        <pre>{JSON.stringify(this.props.state.board)}</pre>
        <div>Player {this.props.state.player}</div>
        <div>Winner {this.props.victory}</div>
        <div>
          {this.props.actions.map(
            action => <input key={this.description(action)} type="button" onClick={() => this.props.dispatch(action)} value={this.description(action)} />
          )}
        </div>
      </div>
    );
  }
}

export default connect(s => s)(IndexPage);
