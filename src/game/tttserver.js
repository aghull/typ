import { JSDOM } from 'jsdom';
global.document = new JSDOM().window.document;

import TicTacToe from '../games/tictactoe';
export default TicTacToe;
