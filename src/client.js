import GameClient from './game/client';
window.game = new GameClient(+location.search.substr(1));
