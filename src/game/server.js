import TicTacToe from '../games/tictactoe';
import { times } from './utils.js';

export default class GameServer {
  constructor() {
    this.game = { id: '123', type: 'tictactoe', state: {}, players: ['a', 'b'], history: [] }; // find DB game
    this.numPlayers = this.game.players.length;
    this._previousState = this.game.history;

    this.channel = new BroadcastChannel('game'); // eslint-disable-line no-undef
    this.channel.onmessage = message => {
      console.log(message);
      switch (message.data.type) {
        case 'action':
          this.engine.receiveAction(message.data.body);
          this.updateClients();
          break;
        case 'join':
          this.updateClients();
          break;
      }
    };

    this.start();
    this.updateClients();
  }

  updateClients() {
    const body = this.engine.serializedState(this.engine.getStart());
    body.player = this.engine.player;
    this.channel.postMessage({ type: 'state', body });
  }

  start() {
    this.player = 0;
    this.players = times(this.numPlayers).map(p => `Player ${p + 1}`);
    this.engine = new TicTacToe(this.player);
    this.game.state = this.engine.start();
  }

  undo() {
    // const previousState = this._previousState.pop();
    // TODO all engines setState(previousState);
    /* this._previousState.push(Object.assign({}, state, {
     *   board: state.board.cloneNode(true),
     *   pile: state.pile.cloneNode(true),
     * }));
     */
  }
}
