import Game from '../../game';
import IndexPage from './Page';

export default class TestGame extends Game {
  setup() {
    this.numPlayers = 2;
    this.page = IndexPage;
  }

  initialState() {
    return {
      board: { A: 1, B: 2, C: 3 },
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
