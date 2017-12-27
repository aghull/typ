import { connect } from 'react-redux';
import Page from '../../game/components/Page';

import './hearts.scss';

class HeartsPage extends Page {
}

export default connect(s => s)(HeartsPage);
