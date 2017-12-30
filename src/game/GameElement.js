const gameElements = [];

export default class GameElement {
  constructor(node, caller = {}) {
    this.node = node;
    this.doc = caller.doc;
    this.game = caller.game;
    this.id = node.id;
    this.type = node.nodeName.toLowerCase();
  }

  wrap(node) {
    if (!(node instanceof Node)) return null;
    const element = gameElements.find(el => el && el.test(node));
    if (!element) throw Error(`No wrapper for node ${node.nodeName}`);
    return new element.className(node, this);
  }

  static wrapNodeAs(index, className, test) {
    gameElements[index] = { className, test };
  }

  attributes() {
    return Array.from(this.node.attributes).
                 filter(attr => attr.name !== 'class' && attr.name !== 'id').
                 reduce((attrs, attr) => Object.assign(attrs, { [attr.name]: isNaN(attr.value) ? attr.value : +attr.value }), {});
  }

  attribute = name => this.attributes()[name]

  setAttribute = (name, value) => this.node.setAttribute(name, value);

  player = () => this.attribute('player');

  parent() {
    return this.node.parentNode && this.wrap(this.node.parentNode);
  }

  branch() {
    const branch = [];
    let node = this.node;
    while (node.parentNode) {
      branch.unshift(Array.from(node.parentNode.childNodes).indexOf(node) + 1);
      node = node.parentNode;
    }
    return branch;
  }

  doc() {
    return this.wrap(this.doc);
  }

  boardNode() {
    return this.doc.children[0];
  }

  board() {
    return this.wrap(this.boardNode());
  }

  pileNode() {
    return this.doc.children[1];
  }

  pile() {
    return this.wrap(this.pileNode());
  }

  place(pieces, to, opts = {}) {
    return this.doc.find('#PILE').move(pieces, to, Object.assign({ limit: 1, within: this.node }, opts));
  }

  static isSpaceNode(node) {
    return node && node.className === 'space';
  }

  static isPieceNode(node) {
    return node && node.className === 'piece';
  }

  serialize() {
    return `GameElement(${JSON.stringify(this.branch())})`;
  }

  static deserialize(doc, args) {
    return doc.find(args.reduce((path, index) => `${path} > *:nth-child(${index})`, 'game'), null);
  }

  toString() {
    return `${this.type}#${this.id}`;
  }
}
