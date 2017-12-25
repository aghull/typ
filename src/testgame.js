import Game from './game.js';

export default class TestGame extends Game {
  initialState() {
    return {
      board: { A: 1, B: 2, C: 3 },
      player: 1,
      players: 2,
    };
  }

  moves = {
    increment: (index, by) =>
      this.choose(index, ['A', 'B', 'C'], () =>
        this.choose(by, [1, 2, 3], () => {
          this.transform(s => s.updateIn(['board', index], a => a + by));
          return this.endTurn();
        })
      )
  }

  nextAction = () => ['increment'];
}