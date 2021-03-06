import Game from '../../game';
import IndexPage from './Page';

export default class TicTacToe extends Game {
  setup() {
    this.numPlayers = 2;
    ['#TL', '#TC', '#TR', '#ML', '#MC', '#MR', '#BL', '#BC', '#BR'].forEach(s => this.board.addSpace(s, 'square', { row: 1 }));
    ['#X', '#O'].forEach(p => this.board.addPieces(9, p, 'mark'));
    this.page = IndexPage;
  }

  victory() {
    return [
      '#TL, #TC, #TR',
      '#ML, #MC, #MR',
      '#BL, #BC, #BR',
      '#TL, #ML, #BL',
      '#TC, #MC, #BC',
      '#TR, #MR, #BR',
      '#TL, #MC, #BR',
      '#TR, #MC, #BL',
    ].map(row => {
      if (this.board.spaces(row).filter(s => s.contains('#X')).length === 3) return 0;
      if (this.board.spaces(row).filter(s => s.contains('#O')).length === 3) return 1;
      return false;
    }).find(r => r !== false);
  }

  moves = {
    tick: cell =>
      this.choose(cell, this.board.spaces('square:empty'), () => {
        cell.add(this.player === 0 ? '#X' : '#O');
        return this.endTurn();
      }),
    reset: () => this.board.clear() && true
  }

  nextAction = () => (this.victory() ? ['reset'] : ['reset', 'tick']);
}
