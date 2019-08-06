import JSDOM from 'jsdom';
global.document = JSDOM().window.document;

import TicTacToe from '../games/tictactoe';
export default TicTacToe;
