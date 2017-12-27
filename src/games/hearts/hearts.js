import Game from '../../game/game';
import IndexPage from './Page';

export default class Hearts extends Game {
  setup() {
    this.page = IndexPage;
    this.numPlayers = 4;
    ['S', 'C', 'D', 'H'].forEach(suit =>
      ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'].forEach((number, value) =>
        this.board().addPiece(`#${number}${suit}`, 'card', { suit, number, value })
      )
    );
    this.eachPlayer(player => {
      this.board().addSpace(`#hand${player}`, 'hand', { player });
      this.board().addSpace(`#played${player}`, 'played', { player });
      this.board().addSpace(`#tricks${player}`, 'tricks', { player });
      this.board().addSpace(`#discard${player}`, 'discard', { player });
    });
  }

  hidden = () => `hand:not([player="${this.player}"]) card, tricks card, discard card`

  moves = {
    deal: () => {
      this.board().clear();
      this.pile().shuffle();
      this.eachPlayer(player => this.pile().move('card', `hand[player="${player}"]`, 13));
      return true;
    },
    play: card =>
      this.choose(card, this.board().findAll(`hand[player="${this.player}"] card`), () => {
        card.move(`played[player="${this.player}"]`);
        return this.endTurn();
      })
  }

  nextAction = () => (['deal', 'play']);
}
