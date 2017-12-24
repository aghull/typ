import React, { Component } from 'react';
import { connect } from 'react-redux';

class IndexPage extends Component {
  move(action) {
    this.props.dispatch(this.props.question[action]);
  }

  renderGameSpace(el) {
    if (typeof el === 'object') {
      return Object.keys(el).map(k => React.DOM.div({ className: k }, this.renderGameSpace(el[k])));
    }
    return el;
  }

  render() {
    return (
      <div>
        <p>Board!</p>
        {this.renderGameSpace(this.props.state.board)}
        <pre>{JSON.stringify(this.props.state.board)}</pre>
        <div>Player {this.props.state.player}</div>
        <div>
          {Object.keys(this.props.question).map(
             action => <input key={action} type="button" onClick={() => this.move(action)} value={action} />
          )}
        </div>
      </div>
    );
  }
}

export default connect(s => s)(IndexPage);
