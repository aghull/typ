import xmldom from 'xmldom';
import qs from "../lib/query-selector";

global.XMLSerializer = xmldom.XMLSerializer;
global.DOMParser = xmldom.DOMParser;

global.document = new xmldom.DOMParser().parseFromString('<xml/>');
global.document.__proto__.querySelectorAll = function(q) {return qs(q, this);}
global.document.__proto__.querySelector = function(q) {return qs(q, this)[0];}

const el = global.document.createElement('el');
el.__proto__.querySelectorAll = function(q) {return qs(q, this);}
el.__proto__.querySelector = function(q) {return qs(q, this)[0];}

import TicTacToe from '../games/tictactoe';
export default TicTacToe;
