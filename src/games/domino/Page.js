import { connect } from 'react-redux';
import Page from '../../game/components/Page';
import Card from './Card';

import './barbu.scss';

class BarbuPage extends Page {
  component(element) {
    return element === 'card' && Card;
  }
}

export default connect(s => s)(BarbuPage);
