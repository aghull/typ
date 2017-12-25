import Game from './game.js';
import { times } from './utils.js';

export default class TicTacToe extends Game {
  constructor() {
    super();
    ['TL', 'TC', 'TR', 'ML', 'MC', 'MR', 'BL', 'BC', 'BR'].forEach(s => this.addSpace(s, 'square'));
    this.players.forEach(
      player => times(9).forEach(
        () => this.addPiece(player === 1 ? 'X' : 'O', 'mark', { player })
      )
    );
  }

  initialState() {
    return {
      player: 1,
      players: 2,
    };
  }

  victory() {
    const rows = [
      ['#TL', '#TC', '#TR'],
      ['#ML', '#MC', '#MR'],
      ['#BL', '#BC', '#BR'],
      ['#TL', '#ML', '#BL'],
      ['#TC', '#MC', '#BC'],
      ['#TR', '#MR', '#BR'],
      ['#TL', '#MC', '#BR'],
      ['#TR', '#MC', '#BL'],
    ];
    return rows.map(row => {
      if (this.count(row.map(square => `${square} #X`).join(',')) === 3) return 1;
      if (this.count(row.map(square => `${square} #O`).join(',')) === 3) return 2;
      return false;
    }).find(r => r);
  }

  moves = {
    tick: (cell) =>
      this.choose(cell, this.findAll('square:empty'), () => {
        this.place(this.player() === 1 ? '#X' : '#O', cell);
        return this.endTurn();
      }),
    reset: () => this.remove('mark') && true
  }

  nextAction = () => (this.victory() ? ['reset'] : ['reset', 'tick']);
}
