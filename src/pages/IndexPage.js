import React, { Component } from 'react';
import { connect } from 'react-redux';
import GameElement from '../GameElement.js';

import style from '../styles/main.scss';

class IndexPage extends Component {

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
      ), Array.from(el.childNodes).map(node => this.renderGameElement(node))
    );
  }

  render() {
    return (
      <div>
        <div className={style.board}>
          {this.renderGameElement(this.props.board)}
        </div>
        <pre>{JSON.stringify(this.props.state)}</pre>
        <div>Player {this.props.player}</div>
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
