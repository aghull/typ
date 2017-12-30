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
      this.board().addSpace(`#pass${player}`, 'pass', { player });
    });
  }

  initialState() {
    return { score: [0, 0, 0, 0] };
  }

  hidden() {
    return 'hand:not(.mine) card, tricks card, pass card';
  }

  victory() {
    return this.state().score.map((score, player) => (score > 50 ? player + 1 : null)).find(p => p);
  }

  moves = {
    play: card => {
      let plays = [];
      if (this.board().count('hand card') === 52) {
        plays = this.board().findAll('#2C');
      } else if (this.state().led) {
        plays = this.board().findAll(`hand.mine card[suit=${this.state().led}]`);
      } else if (!this.board().count('tricks card[suit=H]')) { // hearts not broken
        plays = this.board().findAll('hand.mine card:not([suit=H])');
      }
      if (plays.length === 0) plays = this.board().findAll('hand.mine card');
      return this.choose(card, plays, () => {
        card.move('played.mine');
        this.transform(state => state.update('led', led => led || card.get('suit')));
        return this.endTurn();
      });
    },

    pass: cards =>
      this.choose(cards, this.board().findAll('hand.mine card'), { num: 3 }, () => {
        this.board().move(cards, 'pass.mine');
        return this.endTurn();
      })
  }

  sortCards = () => this.eachPlayer(player =>
    this.board().space(`hand[player=${player}]`).sort(a =>
      (a.get('suit') === 'H' ? '0' : a.get('suit')) + (30 - a.get('rank'))
    )
  );

  nextAction() {
    const played = this.board().findAll('played card');

    if (played.length === 4) { // score the trick
      this.player = played.filter(p => p.get('suit') === this.state().led).
                           sort((a, b) => b.get('rank') - a.get('rank'))[0].
                           parent().player();
      this.board().move(played, 'tricks.mine');
      this.transform(state => state.delete('led'));
    }

    if (this.board().count('tricks card') === 52) { // score the deal
      let score = this.state().score;
      this.board().findAll('[suit=H], #QS').forEach(card =>
        (score[card.parent().player() - 1] += card.id === 'QS' ? 13 : 1)
      );
      if (score.find(s => s === 26)) score = score.map(s => (s === 26 ? 0 : 26));
      this.transform(state => state.set('score', score));
      this.board().clear();
    }

    if (!this.board().count('hand card')) { // need to deal
      this.pile().shuffle();
      this.eachPlayer(player => this.pile().move('card', `hand[player=${player}]`, 13));
      this.sortCards();
    }

    if (this.board().count('pass card') === 12) { // all cards passed
      this.eachPlayer(player =>
        this.board().move(`pass[player=${player}] card`, `hand[player=${player % 4 + 1}]`)
      );
      this.sortCards();
      this.player = this.board().find('#2C').parent().player();
    } else if (this.board().count('hand card') === 52 || this.board().count('pass card')) return ['pass'];

    return ['play'];
  }
}
