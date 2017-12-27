const gameElements = [];

export default class GameElement {
  constructor(node, document) {
    this._node = node;
    this._doc = document;
    this.name = node.id;
    this.type = node.nodeName.toLowerCase();
  }

  wrap(node) {
    if (!(node instanceof Node)) return null;
    const element = gameElements.find(el => el && el.test(node));
    if (!element) throw Error(`No wrapper for node ${node.nodeName}`);
    return new element.className(node, this._doc);
  }

  static wrapNodeAs(index, className, test) {
    gameElements[index] = { className, test };
  }

  attributes(prefix) {
    return Array.from(this._node.attributes).
                 filter(attr => attr.name !== 'class' && attr.name !== 'id').
                 reduce((attrs, attr) => Object.assign(attrs, { [prefix + attr.name]: attr.value }), {});
  }

  attribute = name => this._node.getAttribute(name)

  setAttribute = (name, value) => this._node.setAttribute(name, value);

  parent() {
    return this._node.parentNode && this.wrap(this._node.parentNode, this._doc);
  }

  branch() {
    const branch = [];
    let node = this._node;
    while (node.parentNode) {
      branch.unshift(Array.from(node.parentNode.childNodes).indexOf(node) + 1);
      node = node.parentNode;
    }
    return branch;
  }

  doc() {
    return this.wrap(this._doc);
  }

  boardNode() {
    return this._doc.children[0];
  }

  board() {
    return this.wrap(this.boardNode());
  }

  pileNode() {
    return this._doc.children[1];
  }

  pile() {
    return this.wrap(this.pileNode());
  }

  place(pieces, to, opts = {}) {
    return this._doc.find('#PILE').move(pieces, to, Object.assign({ limit: 1, within: this._node }, opts));
  }

  static isSpaceNode(node) {
    return node && node.className === 'space';
  }

  static isPieceNode(node) {
    return node && node.className === 'piece';
  }
}
