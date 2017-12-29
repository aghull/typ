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
    return 'hand:not(:mine) card, tricks card, pass card';
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
        plays = this.board().findAll(`hand:mine card[suit=${this.state().led}]`);
      } else if (!this.board().count('tricks card[suit=H]')) { // hearts not broken
        plays = this.board().findAll('hand:mine card:not([suit=H])');
      }
      if (plays.length === 0) plays = this.board().findAll('hand:mine card');
      return this.choose(card, plays, () => {
        card.move('played:mine');
        this.transform(state => state.update('led', led => led || card.attribute('suit')));
        return this.endTurn();
      });
    },
    pass: cards =>
      this.choose(cards, this.board().findAll('hand:mine card'), { num: 3 }, () => {
        this.board().move(cards, 'pass:mine');
        return this.endTurn();
      })
  }

  sortCards = () => this.eachPlayer(player =>
    this.board().space(`hand[player=${player}]`).sort(a =>
      (a.attribute('suit') === 'H' ? '0' : a.attribute('suit')) + (30 - a.attribute('rank'))
    )
  );


  nextAction() {
    const played = this.board().findAll('played card');
    if (played.length === 4) {
      const winningNumber = Math.max.apply(Math,
                                           played.filter(c => c.attribute('suit') === this.state().led).
                                                  map(c => c.attribute('rank'))
      );
      const winningPlayer = this.board().find(`played card[rank=${winningNumber}]`).parent().attribute('player');
      this.board().move('played card', `tricks[player=${winningPlayer}]`);
      this.player = winningPlayer;
      this.transform(state => state.delete('led'));
    }
    if (this.board().count('tricks card') === 52) {
      let score = [];
      this.eachPlayer(
        player => (score[player - 1] = this.board().count(`tricks[player=${player}] card[suit=H]`) + (this.board().count(`tricks[player=${player}] #QS`) ? 13 : 0))
      );
      if (Math.max.apply(Math, score) === 26) score = score.map(s => (s === 26 ? 0 : 26));
      this.transform(state => state.update('score', s => s.map((points, player) => points + score[player])));
      this.board().clear();
    }
    if (!this.board().count('hand card')) {
      this.pile().shuffle();
      this.eachPlayer(player => this.pile().move('card', `hand[player=${player}]`, 13));
      this.sortCards();
    }
    if (this.board().count('pass card') === 12) {
      this.eachPlayer(
        player => this.board().move(`pass[player=${player}] card`, `hand[player=${player % 4 + 1}]`)
      );
      this.sortCards();
      this.player = this.board().find('#2C').parent().attribute('player');
    } else if (this.board().count('hand card') === 52 || this.board().count('pass card')) {
      return ['pass'];
    }
    return ['play'];
  }
}
