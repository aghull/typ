import GameElement from './GameElement.js';
import Piece from './Piece.js';
import { times } from './utils.js';

export default class Space extends GameElement {

  find(q = '*') {
    if (q instanceof Node) return q;
    return this._node.querySelector(q);
  }

  findAll(q = '*') {
    if (q instanceof NodeList) return q;
    return this._node.querySelectorAll(q);
  }

  count(q) {
    return this.findAll(q).length;
  }

  element(q) {
    if (q instanceof GameElement) return q;
    return this.wrap(this.find(q));
  }

  elements(q) {
    if (q instanceof Array) return q;
    return Array.from(this.findAll(q)).map(node => this.wrap(node));
  }

  space(q) {
    if (q instanceof Space) return q;
    const node = this.find(q);
    return GameElement.isSpaceNode(node) ? this.wrap(node) : null;
  }

  spaces(q) {
    if (q instanceof Array) return q;
    return Array.from(this.findAll(q)).
                 filter(node => GameElement.isSpaceNode(node)).
                 map(node => this.wrap(node));
  }

  piece(q) {
    if (q instanceof Piece) return q;
    const node = this.find(q);
    return GameElement.isPieceNode(node) ? this.wrap(node) : null;
  }

  pieces(q) {
    if (q instanceof Array) return q;
    return Array.from(this.findAll(q)).
                 filter(node => GameElement.isPieceNode(node)).
                 map(node => this.wrap(node));
  }

  move(pieces, to, num) {
    const space = this.board().space(to);
    let movables = space ? this.pieces(pieces) : [];
    if (num !== undefined) movables = movables.slice(0, num);
    movables.forEach(piece => space._node.insertBefore(piece._node, null));
    return movables;
  }

  add(pieces, num = 1) {
    return this.move(this.pile().pieces(pieces), this, num);
  }

  clear(pieces, num) {
    return this.move(pieces, this.pileNode(), num);
  }

  addSpace = (name, type, attrs) => this.addGameElement(name, type, 'space', attrs)

  addSpaces = (num, name, type, attrs) => times(num).forEach(() => this.addSpace(name, type, attrs))

  addPiece(name, type, attrs) {
    if (this._node === this.boardNode()) {
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
    this._node.appendChild(el);
  }
}

GameElement.wrapNodeAs(1, Space, GameElement.isSpaceNode);
