import Game from '../../game';
import IndexPage from './Page';
import { times } from '../../game/utils';

const suits = ['S', 'C', 'D', 'H'];
const numbers = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const doubles = [[null, false, false, false], [false, null, false, false], [false, false, null, false], [false, false, false, null]];

export default class Barbu extends Game {
  setup() {
    this.page = IndexPage;
    this.numPlayers = 4;
    suits.forEach(suit => {
      numbers.forEach((number, i) =>
        this.board.addPiece(`#${number}${suit}`, 'card', { suit, number, rank: i + 2 })
      );
      this.board.addSpace(`#up${suit}`, 'up', { suit });
      this.board.addSpace(`#starting${suit}`, 'starting', { suit });
      this.board.addSpace(`#down${suit}`, 'down', { suit });
    });
    this.eachPlayer(player => {
      this.board.addSpace(`#hand${player}`, 'hand', { player });
      this.board.addSpace(`#played${player}`, 'played', { player });
      this.board.addSpace(`#tricks${player}`, 'tricks', { player });
    });
  }

  initialState() {
    return {
      dealer: -1,
      doubling: false,
      round: 0,
      score: [0, 0, 0, 0],
      declared: [[], [], [], []],
      doubles,
      totalDoubles: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
    };
  }

  hidden() {
    return 'hand:not(.mine) card, tricks card';
  }

  victory() {
    return this.get('round') === 29 && this.get('score').indexOf(Math.max(...this.get('score')));
  }

  moves = {
    declare: (game, pick) =>
      this.choose(
        game,
        ['no hearts', 'no queens', 'barbu', 'trumps', 'no tricks', 'no last two', 'dominos'].filter(g =>
          this.get('declared')[this.player].indexOf(g) === -1
        ),
        () => {
          this.set('game', game);
          switch (game) {
            case 'dominos':
              return this.choose(pick, numbers, () => {
                this.set('pick', pick);
                return this.endTurn();
              });
            case 'trumps':
              return this.choose(pick, suits, () => this.set('pick', pick) && this.endTurn());
            default:
              return this.endTurn();
          }
        }
      ),

    play: card => {
      let plays = [];

      if (this.get('led')) {
        plays = this.board.findAll(`hand.mine card[suit=${this.get('led')}]`);

        if (this.get('game') === 'trumps') {
          const highestTrump = this.board.highest(`played card[suit=${this.get('pick')}]`, 'rank');
          if (this.get('led') === this.get('pick') || highestTrump && !plays.length) {
            plays = this.board.findAll(`hand.mine card[suit=${this.get('pick')}]`).
                         filter(c => c.get('rank') >= highestTrump.get('rank'));
          } else if (!plays.length) {
            plays = this.board.findAll(`hand.mine card[suit=${this.get('pick')}]`);
          }
        } else {
          plays = this.board.findAll(`hand.mine card[suit=${this.get('led')}]`);
        }
      } else if ((this.get('game') === 'no hearts' || this.get('game') === 'barbu') && this.board.count('hand.mine card:not([suit=H])')) {
        plays = this.board.findAll('hand.mine card:not([suit=H])');
      }

      if (!plays.length) {
        plays = this.board.findAll('hand.mine card');
      }

      return this.choose(card, plays, () => {
        card.move('played.mine');
        this.update('led', led => led || card.get('suit'));
        return this.endTurn();
      });
    },

    playDomino: card => {
      let plays = this.board.findAll(`hand.mine card[number=${this.get('pick')}]`);
      const starting = this.board.find('starting card') ? this.board.find('starting card').get('rank') : undefined;
      if (starting) {
        plays = suits.reduce((p, suit) => {
          if (this.board.count(`#starting${suit} card`)) {
            const highest = this.board.find(`#up${suit} card:last-child`);
            const lowest = this.board.find(`#down${suit} card:last-child`);
            return p.concat([
              { suit, rank: (highest ? highest.get('rank') : starting) + 1 },
              { suit, rank: (lowest ? lowest.get('rank') : starting) - 1 },
            ]);
          }
          return p.concat({ suit, rank: starting });
        }, []);
        plays = plays.map(p => this.board.find(`hand.mine card[suit=${p.suit}][rank=${p.rank}]`)).filter(c => c);
      }
      if (!plays.length) return this.endTurn();

      return this.choose(card, plays, () => {
        let space = 'starting';
        if (card.get('rank') > starting) space = 'up';
        if (card.get('rank') < starting) space = 'down';
        card.move(`#${space}${card.get('suit')}`);
        if (this.board.empty('hand.mine')) this.update('out', out => out.concat(this.player));
        return this.endTurn();
      });
    },

    double: players => {
      const mustDouble = times(this.numPlayers).filter(p => 7 - 2 + this.get('totalDoubles')[this.player][p] < this.get('round') / 4);

      let canDouble = times(this.numPlayers).filter(p => p !== this.player);
      if (this.player === this.get('dealer')) {
        canDouble = canDouble.filter(player => this.get('doubles')[player][this.get('dealer')]);
      } else if (this.get('game') === 'trumps' || this.get('game') === 'dominos') {
        canDouble = [this.get('dealer')];
      }

      return this.choose(players, canDouble, { num: 0, max: 3 }, () => {
        if (mustDouble.find(d => players.indexOf(d) === -1)) return false;
        players.forEach(player => {
          this.setIn(['doubles', this.player, player], true);
          this.updateIn(['totalDoubles', this.player, player], t => t + 1);
        });
        return this.endTurn();
      });
    }
  }

  sortCards = () => this.eachPlayer(player =>
    this.board.space(`hand[player=${player}]`).sort(a =>
      (a.get('suit') === 'H' ? '0' : a.get('suit')) + (30 - a.get('rank'))
    )
  );

  nextAction() {
    const played = this.board.findAll('played card');

    if (played.length === 4) { // score the trick
      const highestTrump = this.get('game') === 'trumps' && this.board.highest(`played card[suit=${this.get('pick')}]`, 'rank');
      this.player = (highestTrump || this.board.highest(`played card[suit=${this.get('led')}]`, 'rank')).parent().player();
      this.board.move(played, 'tricks.mine');
      if (this.get('game') === 'no last two' && this.board.count('tricks card') >= 44) {
        this.update('out', out => out.concat(this.player));
      }
      this.delete('led');
    }

    if (this.get('game') && (!this.board.count('hand card') || this.get('game') === 'barbu' && this.board.find('tricks #KH'))) { // score the deal
      const score = [0, 0, 0, 0];
      switch (this.get('game')) {
        case 'no hearts':
          this.board.findAll('[suit=H]').forEach(card => (score[card.parent().player()] -= card.id === 'AH' ? 6 : 2));
          break;
        case 'no queens':
          this.board.findAll('[number=Q]').forEach(card => (score[card.parent().player()] -= 6));
          break;
        case 'barbu':
          this.board.findAll('#KH').forEach(card => (score[card.parent().player()] -= 20));
          break;
        case 'trumps':
          this.board.findAll('card:nth-child(4n)').forEach(card => (score[card.parent().player()] += 5));
          break;
        case 'no tricks':
          this.board.findAll('card:nth-child(4n)').forEach(card => (score[card.parent().player()] -= 2));
          break;
        case 'no last two':
          [10, 20].forEach((points, out) => (score[this.get('out')[out]] -= points));
          break;
        case 'dominos':
          [45, 20, 5, -5].forEach((points, out) => (score[this.get('out')[out]] = points));
          break;
      }

      const bonus = [0, 0, 0, 0];
      this.get('doubles').forEach((d, p1) => d.forEach((x, p2) => {
        if (x) {
          bonus[p1] += score[p1] - score[p2];
          bonus[p2] -= score[p1] - score[p2];
        }
      }));
      this.eachPlayer(player => this.updateIn(['score', player], p => p + score[player] + bonus[player]));
      this.board.clear();
    }

    if (!this.board.count('hand card')) { // need to deal
      this.board.clear();
      this.pile.shuffle();
      this.eachPlayer(player => this.pile.move('card', `hand[player=${player}]`, 13));
      this.sortCards();
      this.update('dealer', d => (this.player = (d + 1) % 4));
      this.update('round', r => r + 1);
      this.delete('pick');
      this.delete('game');
      this.set('out', []);
      this.set('doubles', doubles);
      this.set('doubling', true);
      return ['declare'];
    }
    if (this.get('doubling')) {
      if (this.player === this.get('dealer')) {
        this.updateIn(['declared', this.player], d => d.concat(this.get('game')));
        this.set('doubling', false);
      }
      return ['double'];
    } else if (this.board.count('hand card') === 52) {
      this.player = this.get('dealer');
    }

    while (this.board.empty('hand.mine')) this.endTurn();
    return [this.get('game') === 'dominos' ? 'playDomino' : 'play'];
  }
}
