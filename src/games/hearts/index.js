import Game from '../../game';
import IndexPage from './Page';

export default class Hearts extends Game {
  setup() {
    this.page = IndexPage;
    this.numPlayers = 4;
    ['S', 'C', 'D', 'H'].forEach(suit =>
      ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'].forEach((number, i) =>
        this.board().addPiece(`#${number}${suit}`, 'card', { suit, number, rank: i + 2 })
      )
    );
    this.eachPlayer(player => {
      this.board().addSpace(`#hand${player}`, 'hand', { player });
      this.board().addSpace(`#played${player}`, 'played', { player });
      this.board().addSpace(`#tricks${player}`, 'tricks', { player });
      this.board().addSpace(`#discard${player}`, 'discard', { player });
    });
  }

  hidden() {
    return 'hand:not(:mine) card, tricks card, discard card';
  }

  moves = {
    deal: () => {
      this.board().clear();
      this.pile().shuffle();
      this.eachPlayer(player => {
        this.pile().move('card', `hand[player=${player}]`, 13);
        this.board().space(`hand[player=${player}]`).sort(
          a => (a.attribute('suit') === 'H' ? '0' : a.attribute('suit')) + (30 - a.attribute('rank'))
        );
      });
      return true;
    },
    play: cards =>
      this.choose(cards, this.board().findAll('hand:mine card'), { num: 2, max: 4 }, () => {
        this.board().move(cards, 'played:mine');
        return this.endTurn();
      })
  }

  nextAction = () => (['deal', 'play']);
}
