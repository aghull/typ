import Game from './game.js';

export default class TicTacToe extends Game {
  setup() {
    this.numPlayers = 2;
    ['#TL', '#TC', '#TR', '#ML', '#MC', '#MR', '#BL', '#BC', '#BR'].forEach(s => this.board().addSpace(s, 'square', { row: 1 }));
    ['#X', '#O'].forEach(p => this.board().addPieces(9, p, 'mark'));
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
      if (this.board().spaces(row).filter(s => s.contains('#X')).length === 3) return 1;
      if (this.board().spaces(row).filter(s => s.contains('#O')).length === 3) return 2;
      return false;
    }).find(r => r);
  }

  moves = {
    tick: (cell) =>
      this.choose(cell, this.board().spaces('square:empty'), () => {
        cell.add(this.player === 1 ? '#X' : '#O');
        return this.endTurn();
      }),
    reset: () => this.board().clear() && true
  }

  nextAction = () => (this.victory() ? ['reset'] : ['reset', 'tick']);
}
