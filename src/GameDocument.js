import GameElement from './GameElement.js';
import Space from './Space.js';

export default class GameDocument extends Space {
  constructor(node) {
    let rootNode = node;
    if (!rootNode) {
      rootNode = document.createElement('game');
      const board = document.createElement('board');
      const pile = document.createElement('pile');
      board.className = 'space';
      board.id = 'board';
      pile.className = 'space';
      rootNode.appendChild(board);
      rootNode.appendChild(pile);
    }
    super(rootNode, rootNode);
  }

  clone = () => new GameDocument(this._doc.cloneNode(true))
}

GameElement.wrapNodeAs(0, GameDocument, node => !node.parentNode);
