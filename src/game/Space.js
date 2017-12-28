import GameElement from './GameElement.js';
import Piece from './Piece.js';
import { times } from './utils.js';

export default class Space extends GameElement {

  _enhanceQuery = q => q.replace(':mine', `[player="${this.game.player}"]`).replace(/#(\d)/, '#\\3$1 ').replace(/([#=])(\d)/, '$1\\3$2 ');

  findNode(q = '*') {
    if (q === null) return null;
    if (q instanceof Node) return q;
    return (this.boardNode() === this.node ? this.doc : this.node).querySelector(this._enhanceQuery(q));
  }

  findNodes(q = '*') {
    if (q === null) return [];
    if (q instanceof NodeList) return q;
    return (this.boardNode() === this.node ? this.doc : this.node).querySelectorAll(this._enhanceQuery(q));
  }

  count(q) {
    return this.findNodes(q).length;
  }

  contains(q) {
    return !!this.findNode(q);
  }

  find(q) {
    if (q instanceof GameElement) return q;
    return this.wrap(this.findNode(q));
  }

  findAll(q) {
    if (q instanceof Array) return q;
    return Array.from(this.findNodes(q)).map(node => this.wrap(node));
  }

  space(q) {
    if (q instanceof Node) return this.wrap(q);
    if (q instanceof Space) return q;
    return this.spaces(q)[0];
  }

  spaces(q) {
    if (q instanceof Array) return q;
    return Array.from(this.findNodes(q)).
                 filter(node => GameElement.isSpaceNode(node)).
                 map(node => this.wrap(node));
  }

  piece(q) {
    if (q instanceof Node) return this.wrap(q);
    if (q instanceof Piece) return q;
    return this.pieces(q)[0];
  }

  pieces(q) {
    if (q instanceof Array) return q;
    return Array.from(this.findNodes(q)).
                 filter(node => GameElement.isPieceNode(node)).
                 map(node => this.wrap(node));
  }

  move(pieces, to, num) {
    const space = this.board().space(to);
    let movables = space ? this.pieces(pieces) : [];
    if (num !== undefined) movables = movables.slice(0, num);
    movables.forEach(piece => space.node.insertBefore(piece.node, null));
    return movables;
  }

  add(pieces, num = 1) {
    return this.move(this.pile().pieces(pieces), this, num);
  }

  clear(pieces, num) {
    return this.move(pieces, this.pileNode(), num);
  }

  shuffle() {
    return times(this.node.childElementCount - 1).forEach(i =>
      this.node.insertBefore(this.node.children[Math.floor(Math.random() * (this.node.childElementCount + 1 - i))], null)
    );
  }

  addSpace = (name, type, attrs) => this.addGameElement(name, type, 'space', attrs)

  addSpaces = (num, name, type, attrs) => times(num).forEach(() => this.addSpace(name, type, attrs))

  addPiece(name, type, attrs) {
    if (this.node === this.boardNode()) {
      return this.pile().addPiece(name, type, attrs);
    }
    return this.addGameElement(name, type, 'piece', attrs);
  }

  addPieces = (num, name, type, attrs) => times(num).forEach(() => this.addPiece(name, type, attrs))

  addGameElement(name, type, className, attrs = {}) {
    const el = document.createElement(type);
    if (name[0] !== '#') throw Error(`id ${name} must start with #`);
    el.id = name.slice(1);
    el.className = className;
    Object.keys(attrs).forEach(attr => el.setAttribute(attr, attrs[attr]));
    this.node.appendChild(el);
  }
}

GameElement.wrapNodeAs(1, Space, GameElement.isSpaceNode);
