import React from 'react';
import { connect } from 'react-redux';
import Page from '../../game/components/Page';
import Card from './Card';

import './barbu.scss';

class BarbuPage extends Page {
  component(element) {
    return element === 'card' && Card;
  }

  scoreBoard() {
    return (
      <div>
        <div>
          <h3>Round {this.props.state.round}{this.props.state.game && `: ${this.props.state.game}`}{this.props.state.pick && ` (${this.props.state.pick})`}</h3>
          {this.props.players.map((player, p) =>
            <div key={p}>
              {player} {this.props.state.score[p]}
              {this.props.player === p || <span> ({this.props.state.totalDoubles[this.props.player][p]} Doubles)</span>}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default connect(s => s)(BarbuPage);
