import GameServer from './game/server';
const gameServer = window.game = new GameServer();

document.getElementById('container').innerHTML = gameServer.game.id;
