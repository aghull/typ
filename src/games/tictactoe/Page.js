import { connect } from 'react-redux';
import Page from '../../game/components/Page';

import './tictactoe.scss';

class TicTacToePage extends Page {
}

export default connect(s => s)(TicTacToePage);
