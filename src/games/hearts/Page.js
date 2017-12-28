import { connect } from 'react-redux';
import Page from '../../game/components/Page';
import Card from './Card';

import './hearts.scss';

class HeartsPage extends Page {
  component(element) {
    return element === 'card' && Card;
  }
}

export default connect(s => s)(HeartsPage);
