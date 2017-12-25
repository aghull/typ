export default class BoardElement {
  constructor(node) {
    this._node = node;
    this.name = node.id;
    this.isPiece = node.className === 'piece';
    this.isSpace = node.className === 'space';
    this.type = node.nodeName.toLowerCase();
    this._attrs = Array.from(node.attributes).
                        filter(attr => attr.name !== 'class' && attr.name !== 'id').
                        reduce((attrs, attr) => Object.assign(attrs, { [attr.name]: attr.value }), {});
    Object.keys(this._attrs).forEach(attr => (this[attr] = this._attrs[attr]));
  }

  parent() {
    return this._node.parentNode && new BoardElement(this._node.parentNode);
  }

  branch() {
    const parent = this.parent();
    return parent ? parent.branch().concat(Array.from(parent._node.childNodes).indexOf(this._node) + 1) : [];
  }
}
